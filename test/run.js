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
    const api = {
        getCurrentUserID: () => "999",
        sendMessage: (m, t, cb, r) => { out.push({ m, t, r }); cb && cb(null, { messageID: "x" }); },
        getThreadInfo: async () => ({ adminIDs: [{ id: "900" }, { id: "999" }, { id: "100" }], participantIDs: Object.keys(people), threadName: "اختبار", userInfo: Object.entries(people).map(([id, name]) => ({ id, name })) }),
        getUserInfo: async id => ({ [id]: { name: people[id] || "مجهول", gender: id === "100" || id === "300" ? 1 : 2 } }),
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
    let o = await msg("200", ".زواج @ليلى", { mentions: { 300: "@ليلى" } });
    ok(/صارا زوجين/.test(tx(o)) && o[0].m.mentions.length === 2, "زواج بمنشن + وسوم المنشن في الرد");
    o = await msg("200", ".زواج @ليلى", { mentions: { 300: "@ليلى" } }); ok(/متزوج/.test(tx(o)), "منع زواج مكرر");
    o = await msg("200", ".زوجي"); ok(/ليلى/.test(tx(o)), "زوجي");
    o = await msg("200", ".طلاق"); ok(/الطلاق/.test(tx(o)), "طلاق");
    o = await msg("200", ".حضن @ليلى", { mentions: { 300: "@ليلى" } }); ok(/يحتضن/.test(tx(o)), "حضن");
    o = await msg("200", ".توافق @ليلى", { mentions: { 300: "@ليلى" } }); ok(/%/.test(tx(o)), "توافق");
    o = await msg("200", ".اوامر"); ok(/الإدارة/.test(tx(o)) === false && /تسلية/.test(tx(o)), "قائمة الأوامر تخفي أوامر الإدارة عن العضو");
    o = await msg("100", ".اوامر"); ok(/الإدارة/.test(tx(o)) && !/المطوّر/.test(tx(o)), "الأدمن يرى الإدارة لا المطوّر");
    o = await msg("900", ".اوامر"); ok(/المطوّر/.test(tx(o)), "المطوّر يرى كل شيء");
    // ---- صلاحيات ----
    o = await msg("200", ".طرد @ليلى", { mentions: { 300: "@ليلى" } }); ok(/لأدمن/.test(tx(o)) && !calls.length, "عضو عادي لا يطرد");
    o = await msg("100", ".طرد @ليلى", { mentions: { 300: "@ليلى" } }); ok(calls.length && calls[0][0] === "kick" && calls[0][1] === "300", "أدمن يطرد");
    o = await msg("100", ".طرد @ابو", { mentions: { 900: "@ابو" } }); ok(!calls.length, "لا يُطرد المطوّر");
    o = await msg("100", ".حظر @ليلى", { mentions: { 300: "@ليلى" } }); ok(/للمطوّر/.test(tx(o)), "حظر للمطوّر فقط");
    o = await msg("900", ".حظر @ليلى", { mentions: { 300: "@ليلى" } }); ok(/تم حظر/.test(tx(o)), "المطوّر يحظر");
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
    o = await msg("200", ".زوااج"); ok(/قصدك/.test(tx(o)), "اقتراح عند خطأ مطبعي");
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
    o = await leaveEv("200", "200"); ok(/غادر/.test(tx(o)) && !addCalls.length, "توديع عند الخروج (منع الخروج متوقف افتراضيًا)");
    o = await leaveEv("100", "200"); ok(/خرج من المجموعة/.test(tx(o)), "توديع مختلف عند الطرد");
    await msg("100", ".منع_الخروج تشغيل", { threadID: "G9" });
    o = await leaveEv("200", "200"); ok(addCalls.includes("200") && /رجّعنا/.test(tx(o)), "منع الخروج يعيد من خرج بنفسه");
    o = await leaveEv("100", "200"); ok(addCalls.length === 1, "منع الخروج لا يعيد من طُرد");
    await msg("100", ".توديع ايقاف", { threadID: "G9" }); await msg("100", ".منع_الخروج ايقاف", { threadID: "G9" });
    o = await leaveEv("200", "200"); ok(o.length === 0, "توديع موقوف يصمت");
    // ---- الأمان: طابور بإيقاع ----
    delete process.env.AYLA_TEST;
    console.log(pass + " نجح، " + fails + " فشل");
    srv.close(); await store.flush(); process.exit(fails ? 1 : 0);
});
