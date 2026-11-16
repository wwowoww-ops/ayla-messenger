require("./src/lib/fonts");
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
    const A = require("./src/core/appstate");
    if (process.env.APPSTATE) {
        const n = A.normalize(process.env.APPSTATE);
        if (n) return n;
        console.error("APPSTATE في البيئة غير مفهوم: ضع JSON من إضافة Cookie-Editor أو نص الكوكيز c_user=...; xs=...");
    }
    try { return A.normalize(fs.readFileSync(path.resolve(cfg.appStatePath), "utf8")); } catch (e) { return null; }
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

// جلسة منتهية: لا نعيد المحاولة بالكوكيز الميتة (تكرار الدخول بها يضاعف شك فيسبوك). ننتظر appstate جديدًا.
const AUTH_ERR = /not logged in|checkpoint|login approvals|expired|session|cookie|appstate|invalid|suspend|disabled|locked|automated|blocked|unauthori[sz]ed|c_user|xs/i;
async function markDead(hash, reason) {
    store.set("dead", { hash, at: Date.now(), reason: String(reason).slice(0, 300) });
    await store.flush();
    console.error("[" + new Date().toISOString() + "] ❌ الجلسة انتهت: " + reason);
}
function idleDead(info) {
    console.error("⛔ الجلسة منتهية منذ " + new Date(info.at).toISOString() + " (السبب: " + info.reason + ").\n" +
        "   لم أعد أحاول الدخول بهذه الكوكيز حتى لا يزداد شك فيسبوك.\n" +
        "   الحل: ادخل بالحساب من متصفحك وتأكد أنه سليم (لا يوجد تحقق أمني)، ثم استخرج appstate جديدًا وضعه في APPSTATE أو appstate.json وأعد النشر.");
    setInterval(() => console.error("⛔ ما زلت بانتظار appstate جديد."), 6 * 3600 * 1000);
}

async function main() {
    const source = readSource();
    if (source && !require("./src/core/appstate").hasSession(source)) { console.error("الكوكيز ناقصة: لا بد من وجود c_user و xs على الأقل (انسخ كوكيز facebook.com كاملة)."); process.exit(1); }
    if (!source || (Array.isArray(source) && !source.length)) { console.error("appstate غير موجود أو فارغ. ضع الكوكيز في المتغير APPSTATE (الأفضل) أو في الملف appstate.json."); process.exit(1); }
    if (!cfg.owners.length) console.warn("[تنبيه] لم تُحدَّد معرّفات المطوّرين (owners)، فلن تعمل أوامر المطوّر.");
    if (!cfg.aiKey) console.warn("[تنبيه] لا يوجد aiKey، فآيلا الذكية معطّلة.");

    await store.init();
    await crashLoopGuard();
    loader.loadAll(path.join(__dirname, "src"));

    const { state, hash, fromStore } = chooseState(source);
    const dead = store.get("dead", null);
    if (dead && dead.hash === hash) return idleDead(dead);
    console.log("[آيلا] الجلسة من " + (fromStore ? "التخزين (محدَّثة)" : "المصدر"));

    const login = require("fca-eryxenx");
    login({ appState: state }, { listenEvents: true, selfListen: false, autoMarkRead: true, online: true }, (err, api) => {
        if (err) {
            const why = String(err.error || err.message || err);
            console.error("[" + new Date().toISOString() + "] فشل تسجيل الدخول:", why);
            if (AUTH_ERR.test(why)) return markDead(hash, why).then(() => idleDead(store.get("dead")));
            return process.exit(1); // خطأ مؤقت (شبكة مثلًا): تُعيد المنصة التشغيل
        }
        console.log("[آيلا] تم الدخول. المعرّف: " + api.getCurrentUserID());
        require("./src/lib/safety").bindApi(api); // لإظهار «يكتب...» قبل كل رسالة
        try { api.sessionGuard(path.resolve(cfg.appStatePath), { interval: 3 * 60 * 1000, debounce: 30 * 1000 }); } catch (e) { /* اختياري */ }

        const saveState = () => { try { const s = api.getAppState(); if (Array.isArray(s) && s.length) store.set("appstate", { state: s, srcHash: hash, at: Date.now() }); } catch (e) { /* لا شيء */ } };
        saveState();
        setInterval(saveState, 10 * 60 * 1000);

        let errors = 0, dying = false;
        api.listenMqtt((e, event) => {
            if (e) {
                errors++;
                const msg = String(e.error || e.message || e);
                console.error("[listen]", msg);
                // خروج واحد فقط عند انتهاء الجلسة فعلًا؛ غير ذلك تتولى المكتبة إعادة الاتصال
                if (!dying && /not logged in|checkpoint|login approvals/i.test(msg) && errors >= 3) {
                    dying = true;
                    try { api.stopListening && api.stopListening(); } catch (x) { /* لا شيء */ }
                    markDead(hash, msg).then(() => idleDead(store.get("dead")));
                }
                return;
            }
            if (dying) return;
            errors = 0;
            dispatch(api, event);
        });
    });
}

process.on("unhandledRejection", e => console.error("[unhandledRejection]", e && (e.message || e)));
process.on("uncaughtException", e => console.error("[uncaughtException]", e && (e.stack || e.message)));
process.on("SIGTERM", async () => { await store.flush(); process.exit(0); });
main();
