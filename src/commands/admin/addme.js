// ضيفي: يضيف عضوًا إلى المجموعة من رابط حسابه أو من معرّفه (ID). للأدمن والمطوّر.
const web = require("../../lib/fbweb");
const safety = require("../../lib/safety");
const { sleep } = require("../../lib/util");
const HOST = /^(?:[a-z0-9-]+\.)?(?:facebook\.com|fb\.com)$/i;
const add = (api, uid, tid) => new Promise((res, rej) => api.addUserToGroup(String(uid), String(tid), e => e ? rej(e) : res()));

// يستخرج معرّفًا رقميًا من نص: رقم مباشر، أو رابط فيه المعرّف، أو رابط باسم مستخدم (نجلب الصفحة بجلسة البوت)
async function resolveId(api, text) {
    const t = String(text || "").trim();
    if (/^\d{5,}$/.test(t)) return t;
    const m = t.match(/https?:\/\/[^\s]+/i);
    if (!m) return null;
    let u; try { u = new URL(m[0]); } catch (e) { return null; }
    if (!HOST.test(u.hostname)) return null; // لا نطلب إلا مواقع فيسبوك
    const direct = u.searchParams.get("id") || u.searchParams.get("fbid") || (u.pathname.match(/\/(?:user|people\/[^/]+|profile)\/(\d{5,})/) || [])[1];
    if (direct && /^\d{5,}$/.test(direct)) return direct;
    try {
        const html = await web.get("https://www.facebook.com" + u.pathname + (u.pathname.includes("profile.php") ? u.search : ""), web.cookieOf(api));
        for (const re of [/"userID":"(\d{5,})"/, /"entity_id":"(\d{5,})"/, /fb:\/\/profile\/(\d{5,})/, /"profile_id":"?(\d{5,})/, /owner_id[^\d]{1,6}(\d{5,})/]) { const x = html.match(re); if (x) return x[1]; }
    } catch (e) { console.error("[ضيفي] تعذّر قراءة الرابط:", e && e.message); }
    return null;
}

module.exports = {
    name: "ضيفي", aliases: ["اضافة", "add"], level: 1, scope: "group", cooldown: 8,
    description: "إضافة عضو إلى المجموعة من رابط حسابه أو معرّفه", usage: "ضيفي <رابط أو ID> | بالرد على رسالة فيها رابط",
    async run(ctx) {
        const tid = String(ctx.event.threadID), p = ctx.prefix, rep = ctx.event.messageReply;
        const input = ctx.args.join(" ").trim() || (rep && rep.body) || "";
        if (!input) return ctx.reply("📝 الاستعمال\n━━━━━━━━━━━━━━━━━━\n↳ " + p + "ضيفي <ID الحساب>\n↳ " + p + "ضيفي <رابط الحساب>\n↳ أو ردّ على رسالة فيها الرابط بـ " + p + "ضيفي");
        await ctx.react("⏳");
        const uid = await resolveId(ctx.api, input);
        if (!uid) { await ctx.react("❌"); return ctx.reply("❌ تعذّر استخراج معرّف الحساب\n↳ جرّب رابط الحساب بصيغة profile.php?id=…\n↳ أو أرسل الـ ID الرقمي مباشرة."); }
        const info = await ctx.api.getThreadInfo(tid).catch(() => null);
        if (info && (info.participantIDs || []).map(String).includes(uid)) { await ctx.react("⚠️"); return ctx.reply("⚠️ هذا الشخص موجود بالفعل في المجموعة\n🆔 " + uid); }
        if (!safety.allowAction()) { await ctx.react("⏳"); return ctx.reply("⏳ نفّذتُ أفعالًا إدارية كثيرة مؤخرًا\n↳ أنتظر دقيقة لحماية الحساب، ثم أعد المحاولة."); }
        let err = null;
        for (let i = 0; i < 3; i++) {
            try { await add(ctx.api, uid, tid); err = null; break; } catch (e) { err = e; await sleep(1500); }
        }
        if (err) {
            await ctx.react("❌");
            console.error("[ضيفي] " + uid + ":", err && (err.message || err.error || err));
            return ctx.reply("❌ فشلت إضافة الحساب\n🆔 " + uid + "\n━━━━━━━━━━━━━━━━━━\n💡 الأسباب المحتملة:\n• الحساب خاص أو أغلق الإضافة للمجموعات\n• الشخص حظر الحساب الذي أستعمله\n• لست أدمن والمجموعة تمنع إضافة الأعضاء\n• الحساب غير صحيح");
        }
        let name = "المستخدم"; try { name = await ctx.nameOf(uid); } catch (e) { /* افتراضي */ }
        await ctx.react("✅");
        const queued = info && (info.approvalMode === true || info.approvalMode === 1 || info.approvalMode === "1");
        return ctx.reply(ctx.mention(["✅ تمت الإضافة\n👤 ", { id: uid, name }, "\n🆔 " + uid + (queued ? "\n📥 الموافقة مفعّلة: قد يظهر الطلب في قائمة الانتظار، استعمل " + p + "قبول" : "")]));
    }
};
