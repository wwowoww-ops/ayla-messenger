// نقطة الدخول: دخول بالـ appstate مع تقليل تسجيلات الدخول (حفظ الجلسة المحدَّثة + حارس حلقة إعادة التشغيل).
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const cfg = require("./src/core/config");
const store = require("./src/core/store");
const loader = require("./src/core/loader");
const { dispatch } = require("./src/core/dispatcher");

const sleep = ms => new Promise(r => setTimeout(r, ms));

function readSource() {
    if (process.env.APPSTATE) {
        try { return JSON.parse(process.env.APPSTATE); } catch (e) { console.error("APPSTATE في البيئة ليس JSON صالحًا"); }
    }
    try { return JSON.parse(fs.readFileSync(path.resolve(cfg.appStatePath), "utf8")); } catch (e) { return null; }
}

// الجلسة المحدَّثة (الكوكيز تتجدد أثناء التشغيل) تُحفظ في التخزين، فلا يُطلب تسجيل دخول جديد بعد كل إعادة تشغيل.
// إن وضعتَ appstate جديدًا (يختلف عن المصدر السابق) يُستعمل الجديد.
function chooseState(source) {
    const hash = crypto.createHash("sha1").update(JSON.stringify(source)).digest("hex");
    const saved = store.get("appstate");
    if (saved && saved.srcHash === hash && Array.isArray(saved.state) && saved.state.length) return { state: saved.state, hash, fromStore: true };
    return { state: source, hash, fromStore: false };
}

// حارس حلقة التشغيل: إن أُعيد تشغيل البوت أكثر من 3 مرات خلال 15 دقيقة ننتظر 30 دقيقة قبل الدخول،
// لأن تكرار تسجيل الدخول السريع هو أكثر ما يُغضب فيسبوك.
async function crashLoopGuard() {
    const now = Date.now();
    const starts = (store.get("starts", []) || []).filter(t => now - t < 15 * 60 * 1000);
    starts.push(now);
    store.set("starts", starts);
    await store.flush();
    if (starts.length > 3) {
        console.error("[حارس] تكرر التشغيل " + starts.length + " مرات خلال 15 دقيقة. سأنتظر 30 دقيقة قبل تسجيل الدخول لحماية الحساب.");
        await sleep(30 * 60 * 1000);
    }
}

async function main() {
    const source = readSource();
    if (!source) { console.error("لا يوجد appstate. ضع الملف appstate.json أو المتغير APPSTATE."); process.exit(1); }
    if (!cfg.owners.length) console.warn("[تنبيه] لم تُحدَّد معرّفات المطوّرين (owners)، فلن تعمل أوامر المطوّر.");
    if (!cfg.aiKey) console.warn("[تنبيه] لا يوجد aiKey، فآيلا الذكية معطّلة.");

    await store.init();
    await crashLoopGuard();
    loader.loadAll(path.join(__dirname, "src"));

    const { state, hash, fromStore } = chooseState(source);
    console.log("[آيلا] الجلسة من " + (fromStore ? "التخزين (محدَّثة)" : "المصدر"));

    const login = require("fca-eryxenx");
    login({ appState: state }, { listenEvents: true, selfListen: false, autoMarkRead: true, online: true }, (err, api) => {
        if (err) { console.error("فشل تسجيل الدخول:", err.error || err.message || err); process.exit(1); }
        console.log("[آيلا] تم الدخول. المعرّف: " + api.getCurrentUserID());
        require("./src/lib/safety").bindApi(api); // لإظهار «يكتب...» قبل كل رسالة
        try { api.sessionGuard(path.resolve(cfg.appStatePath), { interval: 3 * 60 * 1000, debounce: 30 * 1000 }); } catch (e) { /* اختياري */ }

        const saveState = () => { try { const s = api.getAppState(); if (Array.isArray(s) && s.length) store.set("appstate", { state: s, srcHash: hash, at: Date.now() }); } catch (e) { /* لا شيء */ } };
        saveState();
        setInterval(saveState, 10 * 60 * 1000);

        let errors = 0;
        api.listenMqtt((e, event) => {
            if (e) {
                errors++;
                const msg = String(e.error || e.message || e);
                console.error("[listen]", msg);
                // خروج واحد فقط عند انتهاء الجلسة فعلًا؛ غير ذلك تتولى المكتبة إعادة الاتصال
                if (/not logged in|checkpoint|login approvals/i.test(msg) && errors >= 3) { store.flush().then(() => process.exit(1)); }
                return;
            }
            errors = 0;
            dispatch(api, event);
        });
    });
}

process.on("unhandledRejection", e => console.error("[unhandledRejection]", e && (e.message || e)));
process.on("uncaughtException", e => console.error("[uncaughtException]", e && (e.stack || e.message)));
process.on("SIGTERM", async () => { await store.flush(); process.exit(0); });
main();
