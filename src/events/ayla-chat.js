// آيلا الذكية بدون بادئة. الخاص: ترد على كل رسالة. المجموعات: عند ذكر اسمها أو الرد على رسالة لها أو ذكر حسابها.
const ai = require("../lib/ai");
const { guessGender } = require("../lib/gender");
const safety = require("../lib/safety");

const NAME = /(^|[\s،,.!؟?:؛])(?:يا\s*)?(?:آيلا|ايلا|أيلا|ayla)(?=$|[\s،,.!؟?:؛])/i;
const COOLDOWN = 2500;
const busy = new Set(), last = new Map();
const chatBuf = new Map();                      // threadID -> آخر الرسائل (ذاكرة قصيرة)
const BUF_MAX = 14, BUF_TTL = 20 * 60 * 1000;

const clip = (s, n) => String(s || "").replace(/\s+/g, " ").trim().slice(0, n);
function rec(threadID, id, name, text, me) {
    let b = chatBuf.get(threadID);
    if (!b) { b = []; chatBuf.set(threadID, b); if (chatBuf.size > 500) chatBuf.delete(chatBuf.keys().next().value); }
    b.push({ id: String(id), name, text: clip(text, 200), at: Date.now(), me: !!me });
    while (b.length > BUF_MAX) b.shift();
}
const transcript = (threadID, ownerFn) => (chatBuf.get(threadID) || []).filter(e => Date.now() - e.at < BUF_TTL).slice(-10)
    .map(e => "- " + (e.me ? "آيلا" : ownerFn(e.id) ? "أبو هريرة (زوجك ومطوّرك)" : e.name) + ": " + e.text).join("\n");

module.exports = {
    name: "ayla-chat",
    order: 90,
    async onMessage(ctx) {
        const { api, event, cfg, store } = ctx;
        const body = String(event.body || "").trim();
        const photos = (event.attachments || []).filter(a => a && (a.type === "photo" || a.type === "animated_image" || /^image/.test(a.type || "")));
        if (!body && !photos.length) return false;
        const threadID = String(event.threadID), sid = String(event.senderID);
        const isPrivate = !event.isGroup;
        const meId = String(api.getCurrentUserID());
        const off = store.get("ai:off:" + threadID) === true;

        const named = NAME.test(body);
        const replyToMe = !!(event.messageReply && String(event.messageReply.senderID) === meId);
        const mentionMe = !!(event.mentions && Object.keys(event.mentions).includes(meId));
        const explicit = named || replyToMe || mentionMe;

        // سجل المجموعة القصير (حتى الرسائل غير الموجَّهة لها)
        let senderName = null;
        const nm = async () => senderName || (senderName = await ctx.nameOf(sid));
        if (!isPrivate && !off && ai.enabled()) rec(threadID, sid, await nm(), body || "[أرسل صورة]");

        if (!ai.enabled()) return false;
        if (!isPrivate && !explicit) return false;

        // أوامر الإعداد بعد الاسم: تعطيل/تشغيل/نسيان + أوامر المطوّر
        const cmdWord = clip(body.replace(NAME, " "), 700);
        if (named || isPrivate) {
            const word = clip(cmdWord, 30);
            if (/^(نسيان|انسي|انسَي)$/.test(word)) { ai.forget(sid); await ctx.reply("نسيت كل ما دار بيننا 🌸"); return true; }
            if (/^(تعطيل|ايقاف|إيقاف|تشغيل|تفعيل)$/.test(word)) {
                if (!(isPrivate || ctx.isOwner || (await ctx.perms.levelOf(api, event)) >= 1)) { await ctx.reply("هذا الأمر لأدمن المجموعة فقط."); return true; }
                const on = /^(تشغيل|تفعيل)$/.test(word);
                store.set("ai:off:" + threadID, !on);
                await ctx.reply(on ? "رجعت أرد هنا 🌸" : "تمام، سأسكت هنا. نادِني بـ «آيلا تشغيل» لأعود.");
                return true;
            }
            if (ctx.isOwner) {
                const set = /^(?:غيري شخصيتك|شخصيتك الجديدة|شخصيتك)\s*[:：]?\s*([\s\S]{3,})$/.exec(cmdWord);
                if (set) { store.set("persona", set[1].trim().slice(0, 700)); await ctx.reply("تم يا قلبي، صرت كذا من الآن 🌸"); return true; }
                if (/^(?:ارجعي لشخصيتك الأصلية|رجعي شخصيتك|شخصيتك الأصلية)$/.test(clip(cmdWord, 40))) { store.set("persona", ""); await ctx.reply("رجعت لنفسي القديمة 🌸"); return true; }
                if (event.messageReply && /^(?:احذفي|امسحي|احذف|امسح|ازيلي|شيلي)(?:ها|ه|\s.{0,25})?$/.test(cmdWord)) {
                    try { await new Promise((res, rej) => api.unsendMessage(event.messageReply.messageID, e => e ? rej(e) : res())); try { api.unsendMessage(event.messageID, () => {}); } catch (e) { /* لا شيء */ } }
                    catch (e) { await ctx.reply("ما قدرت أحذفها، فيسبوك يسمح للبوت بحذف رسائله هو فقط 🌸"); }
                    return true;
                }
            }
        }
        if (off) return false;

        if (busy.has(sid)) return true;
        if (!safety.FAST && Date.now() - (last.get(sid) || 0) < COOLDOWN) return true;
        last.set(sid, Date.now()); if (last.size > 5000) last.clear();
        busy.add(sid);
        safety.typing(threadID, true, 8000); // يظهر «يكتب...» أثناء انتظار رد الذكاء
        try {
            const name = await nm();
            const g = await guessGender(api, sid);
            const owner = ctx.isOwner;
            let text = (named ? cmdWord : body) || (photos.length ? "(أرسل صورة بلا تعليق)" : "مرحبا");
            let info = (isPrivate ? "محادثة خاصة" : "محادثة في مجموعة") + " مع " + clip(name, 40) + (g ? " (تلميح من فيسبوك لجنسه: " + g + "، تأكدي من الاسم وطريقة الكلام)" : "") + (owner ? "\n" + ai.HUSBAND : "");
            if (!isPrivate) {
                info += "\nالمتحدث الآن: " + (owner ? "أبو هريرة (زوجك ومطوّرك)" : clip(name, 24)) + ". وكل شخص آخر في المجموعة غيره هو شخص مختلف.";
                const rt = event.messageReply;
                if (rt && rt.senderID && String(rt.senderID) !== meId) info += "\nهو يرد على رسالة من " + (cfg.owners.includes(String(rt.senderID)) ? "أبو هريرة (زوجك ومطوّرك)" : clip(await ctx.nameOf(rt.senderID), 24)) + (rt.body ? ": «" + clip(rt.body, 200) + "»" : ".");
                const buf = chatBuf.get(threadID) || []; buf.pop();     // آخر رسالة هي الحالية
                const tr = transcript(threadID, id => cfg.owners.includes(String(id)));
                if (tr) info += "\nآخر ما قيل في المجموعة (الأقدم أولًا):\n" + tr;
            }
            let images = [];
            const src = photos[0] || ((event.messageReply && event.messageReply.attachments) || []).find(a => a && a.type === "photo");
            if (src) {
                const img = await ai.fetchImage(src.url || src.largePreviewUrl || src.previewUrl || "");
                if (!img) { await ctx.reply("ما قدرت أفتح الصورة، جرّب ترسلها مرة ثانية 🌸"); return true; }
                images = [img];
            }
            const reply = await ai.chat(sid, text, info, images);
            if (reply) { if (!isPrivate) rec(threadID, meId, "آيلا", reply, true); await ctx.reply(reply); }
            else if (explicit) await ctx.reply("انشغل بالي شوي، جرّب بعد لحظة 🌸");
        } finally { busy.delete(sid); }
        return true;
    }
};
