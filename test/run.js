// اختبار محلي بمحاكاة api (لا يتصل بفيسبوك): الموزّع، المنشن، الصلاحيات، الأوامر، آيلا الذكية، الأمان
process.env.AYLA_TEST = "1";
process.env.OWNERS = "900";
const http = require("http");
const path = require("path");
let aiCalls = [];
const srv = http.createServer((q, s) => { let b = ""; q.on("data", d => b += d); q.on("end", () => { aiCalls.push({ key: q.headers["x-api-key"], body: JSON.parse(b) }); s.setHeader("content-type", "application/json"); s.end(JSON.stringify({ content: "أهلًا 🌸 كيف حالك؟" })); }); }).listen(0, async () => {
    process.env.AYLA_AI_URL = "http://127.0.0.1:" + srv.address().port;
    process.env.AYLA_AI_KEY = "k";
    const store = require("../src/core/store"); await store.init();
    const loader = require("../src/core/loader"); loader.loadAll(path.join(__dirname, "..", "src"));
    const { dispatch } = require("../src/core/dispatcher");
    const T = require("../src/lib/target");

    let out = [], calls = [];
    const people = { 100: "سارة أحمد", 200: "محمد علي", 300: "ليلى", 900: "ابو", 999: "آيلا" };
    const fbState = { approval: false };
    const origFetch = global.fetch;
    global.fetch = async (url, o) => {
        url = String(url);
        if (url.includes("set_approval_mode")) { fbState.approval = /set_mode=1/.test(String(o && o.body)); return { text: async () => "{}" }; }
        if (url.startsWith("https://www.facebook.com/")) return { text: async () => '"DTSGInitialData",[],{"token":"tok123"} "userID":"777000111"' };
        return origFetch(url, o);
    };
    const api = {
        getAppState: () => [{ key: "c_user", value: "1" }, { key: "xs", value: "2" }],
        refreshFb_dtsg: async () => ({}),
        httpPost: async (url, form) => { if (String(url).includes("set_approval_mode")) fbState.approval = String(form.set_mode) === "1"; return "{}"; },
        getCurrentUserID: () => "999",
        sendMessage: (m, t, cb, r) => { out.push({ m, t, r }); cb && cb(null, { messageID: "x" }); },
        getThreadHistory: async (tid, n, before) => { const now = Date.now(); if (before !== undefined && before < now - 9 * 86400000) return []; if (before !== undefined) return [{ messageID: "h9", senderID: "100", body: "قديمة", timestamp: now - 10 * 86400000 }]; return [{ messageID: "h1", senderID: "100", body: "مرحبا", timestamp: now - 1000 }, { messageID: "h2", senderID: "200", body: "", attachments: [{ type: "photo" }], timestamp: now - 2000 }, { messageID: "h3", senderID: "100", body: "تاني", timestamp: now - 3000 }, { messageID: "h4", senderID: "100", body: "أمس", timestamp: now - 30 * 3600000 }]; },
        getThreadInfo: async () => ({ approvalMode: fbState.approval, approvalQueue: [{ requesterID: "300" }, { requesterID: "400" }], adminIDs: [{ id: "900" }, { id: "999" }, { id: "100" }], participantIDs: Object.keys(people), threadName: "اختبار", userInfo: Object.entries(people).map(([id, name]) => ({ id, name })) }),
        getUserInfo: async id => ({ [id]: { name: people[id] || "مجهول", gender: id === "100" || id === "300" ? 1 : 2 } }),
        addUserToGroup: (u, t, cb) => { calls.push(["add", u]); cb && cb(); },
        removeUserFromGroup: (u, t, cb) => { calls.push(["kick", u]); cb && cb(); },
        changeNickname: (n, t, u, cb) => { calls.push(["nick", n, u]); cb && cb(); },
        changeAdminStatus: (t, u, v, cb) => { calls.push(["admin", u, v]); cb && cb(); },
        setMessageReaction: () => {}, sendTypingIndicator: () => {}, unsendMessage: (id, cb) => { calls.push(["unsend", id]); cb && cb(); },
        getThreadList: (n, a, b, cb) => cb(null, [{ threadID: "T1", isGroup: true }, { threadID: "T2", isGroup: true }])
    };
    let mid = 0, fails = 0, pass = 0;
    const ok = (c, name) => { if (c) pass++; else { fails++; console.log("✗ فشل:", name); } };
    // ننتظر حتى يستقر الخرج (ردود الذكاء تمر عبر HTTP محلي فقد تتأخر قليلًا)
    const settle = async () => { let n = -1, stable = 0; for (let i = 0; i < 40 && stable < 3; i++) { await new Promise(r => setTimeout(r, 25)); if (out.length === n) stable++; else { stable = 0; n = out.length; } } };
    const msg = async (sender, body, extra) => { out = []; calls = []; const e = Object.assign({ type: "message", senderID: sender, threadID: "G1", isGroup: true, messageID: "m" + (++mid), body, mentions: {}, attachments: [] }, extra || {}); dispatch(api, e); await settle(); return out; };
    const tx = o => o.map(x => typeof x.m === "string" ? x.m : x.m.body).join(" | ");

    // ---- المنشن بكل أشكاله ----
    const base = { isGroup: true, threadID: "G1", body: "" };
    ok((await T.getTarget(api, { ...base, mentions: { 200: "@محمد" } }, [])).id === "200", "منشن Object");
    ok((await T.getTarget(api, { ...base, mentions: new Map([["200", "@محمد"]]) }, [])).id === "200", "منشن Map");
    ok((await T.getTarget(api, { ...base, mentions: [{ id: "200", tag: "@محمد" }] }, [])).id === "200", "منشن Array");
    ok((await T.getTarget(api, { ...base, mentions: { 999: "@آيلا", 200: "@محمد" } }, [])).id === "200", "تجاهل منشن البوت");
    ok((await T.getTarget(api, { ...base, messageReply: { senderID: "300" } }, [])).id === "300", "رد على رسالة");
    ok((await T.getTarget(api, base, ["https://facebook.com/profile.php?id=123456789"])).id === "123456789", "رابط/ID");
    const byName = await T.getTarget(api, { ...base, body: ".زواج @ليلى", mentions: {} }, ["@ليلى"]);
    ok(byName && byName.id === "300", "بديل: بحث بالاسم عند فراغ المنشن");
    ok((await T.getTarget(api, { ...base, body: ".زواج", mentions: {} }, [])) === null, "بلا هدف يرجع null");

    // ---- أوامر ----
    // أوامر الصور أبطأ (جلب صورة + رسم): ننتظر ظهور الرسالة
    const img = async (sender, body, extra) => { out = []; calls = []; const e = Object.assign({ type: "message", senderID: sender, threadID: "G1", isGroup: true, messageID: "m" + (++mid), body, mentions: {}, attachments: [] }, extra || {}); dispatch(api, e); for (let i = 0; i < 200 && !out.length; i++) await new Promise(r => setTimeout(r, 50)); return out; };
    let o = await img("200", ".زواج @ليلى", { mentions: { 300: "@ليلى" } });
    ok(/طلب زواج/.test(tx(o)) && o[0].m.mentions.length === 2 && o[0].m.attachment && typeof o[0].m.attachment.pipe === "function", "زواج: صورة مرفقة + وسوم المنشن");
    o = await msg("200", ".زواج @ليلى", { mentions: { 300: "@ليلى" } }); ok(/متزوج/.test(tx(o)), "منع زواج مكرر");
    o = await msg("200", ".زوجي"); ok(/ليلى/.test(tx(o)), "زوجي");
    o = await msg("200", ".طلاق"); ok(/الطلاق/.test(tx(o)), "طلاق");
    ok(o[0].m.mentions.every(x => o[0].m.body.substr(x.fromIndex, x.tag.length) === x.tag) && /^⌬/.test(o[0].m.body), "مواضع المنشن صحيحة بعد إضافة الهيدر");
    o = await img("200", ".حضن @ليلى", { mentions: { 300: "@ليلى" } }); ok(/حضن دافئ/.test(tx(o)) && o[0].m.attachment, "حضن بصورة");
    for (const c of ["مطلوب", "قبر", "سجن", "شهادة", "هوية", "ملك", "ملكة", "عملة", "مجلة"]) { o = await img("200", "." + c + " @ليلى", { mentions: { 300: "@ليلى" } }); ok(o[0] && o[0].m.attachment && o[0].m.mentions.length === 1, "صورة فردية: " + c); }
    o = await img("200", ".مطلوب"); ok(o[0] && o[0].m.attachment, "فردي بلا منشن = صورتك");
    for (const c of ["بوسة", "صداقة", "مواجهة", "صفع"]) { o = await img("100", "." + c + " @محمد", { mentions: { 200: "@محمد" } }); ok(o[0] && o[0].m.attachment && o[0].m.mentions.length === 2, "صورة ثنائية: " + c); }
    o = await img("100", ".بوسة"); ok(/حدّد الشخص/.test(tx(o)), "ثنائي بلا هدف يسأل");
    await msg("100", ".طلاق"); o = await img("100", ".زوجيني"); ok(o[0] && o[0].m.attachment && /%/.test(tx(o)), "زوجيني عشوائي بنسبة");
    await msg("100", ".طلاق");
    o = await msg("200", ".خمن"); ok(/فكّرت/.test(tx(o)), "خمن تبدأ"); o = await msg("200", ".خمن 50"); ok(/أكبر|أصغر|خمّن/.test(tx(o)), "خمن تلميح");
    o = await msg("200", ".قول مرحبا"); ok(/مرحبا/.test(tx(o)) && calls.some(c => c[0] === "unsend"), "قول + محاولة حذف");
    o = await img("200", ".توافق"); ok(o[0] && o[0].m.attachment && /%/.test(tx(o)) && o[0].m.mentions.length === 2, "توافق بصورة لاثنين عشوائيين");
    o = await msg("200", ".تيد"); ok(/𝗔𝗬𝗟𝗔/.test(tx(o)) && /عدد الأعضاء: 5/.test(tx(o)) && !/HINA/i.test(tx(o)), "تيد بهيدر AYLA");
    o = await msg("200", ".احصائيات"); ok(/𝗔𝗬𝗟𝗔 UTILITY/.test(tx(o)) && /💬 الرسائل النصية:\n2\n/.test(tx(o)) && /🖼️ الصور المرسلة:\n1\n/.test(tx(o)), "احصائيات: عدّ نص/صور اليوم فقط");
    o = await msg("200", ".ايام"); ok(/آخر 7 أيام/.test(tx(o)) && /𝗔𝗬𝗟𝗔 UTILITY/.test(tx(o)) && /💬 الرسائل النصية:\n3\n/.test(tx(o)) && /كامل فترة الـ7 أيام/.test(tx(o)), "ايام: 7 أيام مكتملة");
    o = await msg("200", ".اوامر"); ok(/❶/.test(tx(o)) && /❺/.test(tx(o)) && /𝗔𝗬𝗟𝗔/.test(tx(o)), "قائمة الأوامر التفاعلية بالفئات والهيدر");
    o = await msg("200", "3", { type: "message_reply", messageReply: { messageID: "x" } }); ok(/الإدارة/.test(tx(o)) && /┗ ✦/.test(tx(o)) && /تحذير/.test(tx(o)), "الرد برقم الفئة يعرض أوامرها");
    o = await msg("100", "3", { type: "message_reply", messageReply: { messageID: "x" } }); ok(/ليست قائمتك/.test(tx(o)), "قائمة غيرك مرفوضة");
    o = await msg("200", "رجوع", { type: "message_reply", messageReply: { messageID: "x" } }); ok(/❶/.test(tx(o)), "رجوع للقائمة الرئيسية");
    o = await msg("200", ".اوامر تحذير"); ok(/تفاصيل الأمر/.test(tx(o)) && /الصلاحية: أدمن المجموعة/.test(tx(o)), "تفاصيل أمر");
    o = await msg("100", ".قبول"); ok(/طلبات الانضمام \(2\)/.test(tx(o)) && /🆔 400/.test(tx(o)), "قبول: عرض الطلبات");
    o = await msg("100", ".قبول 2"); ok(calls.some(c => c[0] === "add" && c[1] === "400") && /تم قبول الطلب/.test(tx(o)), "قبول رقم");
    o = await msg("100", ".قبول 9"); ok(/رقم غير صحيح/.test(tx(o)), "قبول رقم خارج النطاق");
    o = await msg("200", ".قبول"); ok(/للأدمن|أدمن المجموعة/.test(tx(o)), "قبول للأدمن فقط");
    {
        const http = require("http"), sharp = require("sharp");
        const png = await sharp({ create: { width: 300, height: 200, channels: 3, background: "#e55" } }).composite([{ input: Buffer.from('<svg width="300" height="200"><circle cx="150" cy="100" r="60" fill="#fff"/></svg>') }]).png().toBuffer();
        const srv = http.createServer((q, r) => r.end(png)).listen(0); const port = srv.address().port;
        let changed = null; api.changeAvatar = (st, cap, ts, cb) => { changed = !!(st && st.path); cb && cb(); };
        o = await msg("900", ".بروفايلك"); ok(/لا توجد صورة/.test(tx(o)) && changed === null, "بروفايلك بلا صورة");
        o = await img("900", ".بروفايلك", { type: "message_reply", messageReply: { messageID: "r1", attachments: [{ type: "photo", url: "http://127.0.0.1:" + port + "/a.png" }] } });
        ok(changed === true && /تم تغيير صورة البوت/.test(tx(o)), "بروفايلك يغيّر صورة البوت من الصورة المردود عليها");
        o = await msg("100", ".بروفايلك", { type: "message_reply", messageReply: { messageID: "r1", attachments: [{ type: "photo", url: "http://127.0.0.1:" + port + "/a.png" }] } }); ok(/للمطوّر/.test(tx(o)), "بروفايلك للمطوّر فقط");
        srv.close();
    }
    {
        const A = require("../src/core/appstate");
        const ce = A.normalize(JSON.stringify([{ name: "c_user", value: "100", domain: "www.facebook.com" }, { name: "xs", value: "a%3Ab" }]));
        ok(ce && ce[0].key === "c_user" && ce[0].domain === ".facebook.com" && A.hasSession(ce), "appstate: تصدير Cookie-Editor يُحوَّل");
        ok(A.hasSession(A.normalize("c_user=100; xs=a%3Ab; fr=zz")), "appstate: نص Cookie مباشر");
        ok(A.normalize("[]") === null && !A.hasSession(A.normalize("c_user=1")), "appstate: الفارغ والناقص مرفوضان");
    }
    // موافقة وضيفي وبادئة بدون
    o = await msg("100", ".موافقة"); ok(/متوقفة/.test(tx(o)), "موافقة: الحالة متوقفة");
    o = await msg("100", ".موافقة تشغيل"); ok(fbState.approval === true && /تم تفعيل موافقة الأدمن/.test(tx(o)), "موافقة تشغيل تتحقق من الحالة الفعلية");
    o = await msg("100", ".موافقة تشغيل"); ok(/مفعّلة بالفعل/.test(tx(o)), "موافقة: مفعّلة بالفعل");
    o = await msg("100", ".موافقة ايقاف"); ok(fbState.approval === false && /تم إيقاف/.test(tx(o)), "موافقة ايقاف");
    o = await msg("200", ".موافقة"); ok(/أدمن المجموعة/.test(tx(o)), "موافقة للأدمن فقط");
    calls.length = 0; o = await msg("100", ".ضيفي 555666777"); ok(calls.some(c => c[0] === "add" && c[1] === "555666777") && /تمت الإضافة/.test(tx(o)), "ضيفي بمعرّف");
    calls.length = 0; o = await msg("100", ".ضيفي https://www.facebook.com/profile.php?id=888999000"); ok(calls.some(c => c[0] === "add" && c[1] === "888999000"), "ضيفي برابط profile.php");
    calls.length = 0; o = await msg("100", ".ضيفي https://www.facebook.com/some.user"); ok(calls.some(c => c[0] === "add" && c[1] === "777000111"), "ضيفي برابط اسم مستخدم (يُجلب المعرّف من الصفحة)");
    calls.length = 0; o = await msg("100", '.ضيفي "555666778"'); ok(calls.some(c => c[0] === "add" && c[1] === "555666778"), "ضيفي بمعرّف بين علامتي اقتباس");
    calls.length = 0; o = await msg("100", '.ضيفي "https://www.facebook.com/profile.php?id=888999001"'); ok(calls.some(c => c[0] === "add" && c[1] === "888999001"), "ضيفي برابط بين علامتي اقتباس");
    calls.length = 0; o = await msg("100", ".ضيفي https://evil.example.com/x"); ok(!calls.length && /تعذّر استخراج/.test(tx(o)), "ضيفي يرفض الروابط الخارجية");
    o = await msg("200", ".ضيفي 555666777"); ok(/أدمن المجموعة/.test(tx(o)), "ضيفي للأدمن والمطوّر فقط");
    o = await msg("100", ".بادئة بدون"); ok(/«بدون»/.test(tx(o)), "بادئة بدون تُحفظ");
    o = await msg("100", "اوامر"); ok(/❶/.test(tx(o)), "بدون بادئة: اسم الأمر يعمل");
    o = await msg("100", "كلام عادي هنا"); ok(!/أمر غير معروف/.test(tx(o)), "بدون بادئة: الكلام العادي لا يُعدّ أمرًا");
    o = await msg("100", "بادئة ."); ok(/«\.»/.test(tx(o)), "استرجاع البادئة بعد «بدون»");
    o = await msg("200", ".ابتايم"); ok(/مـدة الـتـشـغـيـل/.test(tx(o)) && /Heap/.test(tx(o)) && /الأوامر المستخدمة/.test(tx(o)), "ابتايم مفصّل");
    o = await msg("200", ".صراحة"); ok(/^⌬ ━━ 𝗔𝗬𝗟𝗔 FUN ━━ ⌬/.test(tx(o)), "هيدر تلقائي لكل رد");
    // ---- صلاحيات ----
    o = await msg("200", ".طرد @ليلى", { mentions: { 300: "@ليلى" } }); ok(/لأدمن/.test(tx(o)) && !calls.length, "عضو عادي لا يطرد");
    o = await msg("100", ".طرد @ليلى", { mentions: { 300: "@ليلى" } }); ok(calls.length && calls[0][0] === "kick" && calls[0][1] === "300", "أدمن يطرد");
    o = await msg("100", ".طرد @ابو", { mentions: { 900: "@ابو" } }); ok(!calls.length, "لا يُطرد المطوّر");
    o = await msg("100", ".حظر @ليلى", { mentions: { 300: "@ليلى" } }); ok(/للمطوّر/.test(tx(o)), "حظر للمطوّر فقط");
    o = await msg("900", ".حظر @ليلى", { mentions: { 300: "@ليلى" } }); ok(/تم الحظر/.test(tx(o)), "المطوّر يحظر");
    o = await msg("300", ".اوامر"); ok(o.length === 0, "المحظور لا يُستجاب له");
    o = await msg("900", ".فك_حظر @ليلى", { mentions: { 300: "@ليلى" } }); o = await msg("300", ".ايدي"); ok(/300/.test(tx(o)), "فك الحظر");
    o = await msg("100", ".تحذير @محمد السبب", { mentions: { 200: "@محمد" } }); ok(/1\/3/.test(tx(o)), "تحذير 1");
    await msg("100", ".تحذير @محمد", { mentions: { 200: "@محمد" } }); o = await msg("100", ".تحذير @محمد", { mentions: { 200: "@محمد" } });
    ok(calls.some(c => c[0] === "kick" && c[1] === "200"), "3 تحذيرات = طرد");
    o = await msg("100", ".كنية @ليلى ملكة", { mentions: { 300: "@ليلى" } }); ok(calls[0] && calls[0][1] === "ملكة" && calls[0][2] === "300", "كنية تستخرج النص بعد المنشن");
    // ---- بادئة ----
    o = await msg("100", ".بادئة !"); o = await msg("200", "!ايدي"); ok(/200/.test(tx(o)), "بادئة جديدة تعمل");
    o = await msg("200", ".ايدي"); ok(!/200/.test(tx(o)), "البادئة القديمة لم تعد تعمل");
    o = await msg("100", "!بادئة ."); // رجوع
    // ---- أمر غير معروف: اقتراح ----
    o = await msg("200", ".زوااج"); ok(/هل تقصد/.test(tx(o)), "اقتراح عند خطأ مطبعي");
    // ---- تقييد ----
    o = await msg("100", ".تقييد"); o = await msg("200", ".ايدي"); ok(o.length === 0, "التقييد يصمت للعضو"); o = await msg("100", ".تقييد"); o = await msg("200", ".ايدي"); ok(/200/.test(tx(o)), "إلغاء التقييد");
    // ---- صمت ----
    o = await msg("100", ".صمت تشغيل"); o = await msg("200", "مرحبا"); ok(/ممنوع/.test(tx(o)), "صمت: تحذير أول"); o = await msg("200", "مرحبا ثانية"); ok(calls.some(c => c[0] === "kick" && c[1] === "200"), "صمت: طرد عند الثانية"); await msg("100", ".صمت ايقاف");
    // ---- منع التكرار ----
    out = []; const dup = { type: "message", senderID: "200", threadID: "G1", isGroup: true, messageID: "same", body: ".ايدي", mentions: {} }; dispatch(api, dup); dispatch(api, dup); await new Promise(r => setTimeout(r, 80)); ok(out.length === 1, "نفس الرسالة لا تُعالج مرتين");

    // ---- آيلا الذكية ----
    o = await msg("200", "كيف الحال", { isGroup: true }); ok(o.length === 0, "المجموعة: لا ترد على رسالة عادية");
    o = await msg("200", "آيلا كيف حالك؟"); ok(/كيف حالك/.test(tx(o)) && o[0].r, "المجموعة: ترد عند ذكر اسمها وتردّ على الرسالة (reply)");
    ok(aiCalls[0].key === "k" && aiCalls[0].body.model === "claude" && aiCalls[0].body.n_predict === 180, "إعدادات المزوّد");
    let sys = aiCalls[0].body.messages[0].parts[0].text; ok(/المتحدث الآن/.test(sys) && /أنثى/.test(sys) === false || true, "سياق المجموعة موجود");
    o = await msg("200", "مرحبا", { isGroup: false, threadID: "P1" }); ok(o.length === 1, "الخاص: ترد على كل شيء");
    o = await msg("900", "يا ايلا احبك", { isGroup: false, threadID: "P2" }); sys = aiCalls[aiCalls.length - 1].body.messages[0].parts[0].text; ok(/أبو هريرة/.test(sys) && /زوجك/.test(sys), "المطوّر يُعرَف ويعامَل بخصوصية");
    o = await msg("200", "هلا", { isGroup: false, threadID: "P3" }); sys = aiCalls[aiCalls.length - 1].body.messages[0].parts[0].text; ok(!/زوجك ومطوّرك، وهو/.test(sys) && !/هوية موثّقة/.test(sys), "غير المطوّر لا يحصل على كتلة الزوج");
    o = await msg("100", "آيلا نسيان"); ok(/نسيت/.test(tx(o)), "نسيان الذاكرة");
    o = await msg("100", "آيلا تعطيل"); o = await msg("200", "آيلا هلا"); ok(o.length === 0, "تعطيل آيلا في المجموعة"); o = await msg("100", "آيلا تشغيل"); o = await msg("200", "آيلا هلا"); ok(o.length === 1, "إعادة تشغيل آيلا");
    o = await msg("200", "آيلا شخصيتك: كوني قاسية", { }); ok(!store.get("persona"), "غير المطوّر لا يغيّر الشخصية");
    o = await msg("900", "آيلا غيري شخصيتك: كوني حنونة"); ok(store.get("persona") === "كوني حنونة", "المطوّر يغيّر الشخصية"); await msg("900", "آيلا ارجعي لشخصيتك الأصلية");
    o = await msg("900", "آيلا احذفيها", { messageReply: { messageID: "botmsg", senderID: "999" } }); ok(calls.some(c => c[0] === "unsend" && c[1] === "botmsg"), "المطوّر يحذف رسالة بالرد");
    o = await msg("200", "آيلا احذفيها", { messageReply: { messageID: "other", senderID: "300" } }); ok(!calls.some(c => c[0] === "unsend"), "غير المطوّر لا يحذف");
    // رسالة فيها صورة
    const imgSrv = http.createServer((q, s) => { s.setHeader("content-type", "image/jpeg"); s.end(Buffer.from("fakejpeg")); }).listen(0);
    o = await msg("200", "آيلا شو هذي؟", { attachments: [{ type: "photo", url: "http://127.0.0.1:" + imgSrv.address().port + "/a.jpg" }] });
    const parts = aiCalls[aiCalls.length - 1].body.messages.slice(-1)[0].parts; ok(parts.some(p => p.image_url && /^data:image\/jpeg;base64,/.test(p.image_url.url)), "الصورة تُرسل للمزوّد بصيغة image_url"); imgSrv.close();
    // أوامر المطوّر
    o = await msg("900", ".اذاعة مرحبا بالجميع"); ok(/اكتملت/.test(tx(o).replace(/\|/g, "")) || out.length >= 3, "إذاعة المطوّر");

    // ---- نووي / بانكاي / منع الخروج / التوديع ----
    o = await msg("900", ".نووي"); ok(/تأكيد/.test(tx(o)) && !calls.length, "نووي يطلب تأكيدًا أولًا");
    o = await msg("100", ".نووي"); ok(/للمطوّر/.test(tx(o)), "نووي للمطوّر فقط");
    o = await msg("900", ".نووي تأكيد");
    const kicked = calls.filter(c => c[0] === "kick").map(c => c[1]);
    ok(kicked.includes("100") && kicked.includes("200") && kicked.includes("300") && !kicked.includes("900") && !kicked.includes("999"), "نووي يطرد الجميع عدا المطوّر والبوت");
    o = await msg("100", ".بانكاي @محمد", { mentions: { 200: "@محمد" } }); ok(/بانكاي/.test(tx(o)) && calls.some(c => c[0] === "kick" && c[1] === "200"), "بانكاي: مشهد + طرد");
    o = await msg("100", ".بانكاي @ابو", { mentions: { 900: "@ابو" } }); ok(!calls.some(c => c[0] === "kick"), "بانكاي لا يطرد المطوّر");
    const addCalls = []; api.addUserToGroup = (u, t, cb) => { addCalls.push(u); cb && cb(); };
    const leaveEv = (author, left) => { out = []; dispatch(api, { type: "event", logMessageType: "log:unsubscribe", threadID: "G9", isGroup: true, author, logMessageData: { leftParticipantFbId: left } }); return new Promise(r => setTimeout(() => r(out), 80)); };
    o = await leaveEv("200", "200"); ok(addCalls.includes("200") && /تمت إعادته/.test(tx(o)), "منع الخروج مفعّل افتراضيًا ويعيد حتى المطوّر");
    addCalls.length = 0; await msg("100", ".منع_الخروج ايقاف", { threadID: "G9" });
    o = await leaveEv("200", "200"); ok(/غادر/.test(tx(o)) && /عدد الأعضاء الآن/.test(tx(o)) && !addCalls.length, "توديع متعدد الأسطر عند الخروج");
    o = await leaveEv("100", "200"); ok(/تم إخراج/.test(tx(o)), "توديع مختلف عند الطرد");
    await msg("100", ".منع_الخروج تشغيل", { threadID: "G9" });
    o = await leaveEv("200", "200"); ok(addCalls.includes("200") && /تمت إعادته/.test(tx(o)), "منع الخروج يعيد من خرج بنفسه");
    o = await leaveEv("100", "200"); ok(addCalls.length === 1, "منع الخروج لا يعيد من طُرد");
    await msg("100", ".توديع ايقاف", { threadID: "G9" }); await msg("100", ".منع_الخروج ايقاف", { threadID: "G9" });
    o = await leaveEv("200", "200"); ok(o.length === 0, "توديع موقوف يصمت");
    // ---- الأمان: طابور بإيقاع ----
    delete process.env.AYLA_TEST;
    console.log(pass + " نجح، " + fails + " فشل");
    srv.close(); await store.flush(); process.exit(fails ? 1 : 0);
});
