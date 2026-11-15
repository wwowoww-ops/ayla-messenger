// نووي: طرد كل الأعضاء ما عدا المطوّرين والبوت. للمطوّر فقط، يتطلب أن يكون البوت أدمن، ويحتاج تأكيدًا.
// يُنفَّذ ببطء (2–4 ثوان لكل عضو) لأن الطرد الجماعي السريع هو أخطر ما يعرّض الحساب للتقييد.
const safety = require("../../lib/safety");
const pending = new Map();           // threadID -> { by, at }
const running = new Set();
module.exports = {
    name: "نووي", aliases: ["nuke"], level: 2, scope: "group", cooldown: 30,
    description: "طرد جميع أعضاء المجموعة ما عدا المطوّرين (بتأكيد، وببطء)", usage: "نووي ثم: نووي تأكيد",
    async run(ctx) {
        const threadID = String(ctx.event.threadID);
        if (running.has(threadID)) return ctx.reply("العملية جارية بالفعل.");
        if (!(await ctx.perms.botIsAdmin(ctx.api, threadID))) return ctx.reply("لازم أكون أدمن في المجموعة.");
        const p = pending.get(threadID);
        if (!/^(تأكيد|تاكيد|confirm)$/.test(ctx.args[0] || "") || !p || p.by !== String(ctx.event.senderID) || Date.now() - p.at > 30000) {
            pending.set(threadID, { by: String(ctx.event.senderID), at: Date.now() });
            return ctx.reply("☢️ سأطرد جميع الأعضاء ما عدا المطوّرين وأنا.\nللتأكيد خلال 30 ثانية اكتب: " + ctx.prefix + "نووي تأكيد");
        }
        pending.delete(threadID);
        let info;
        try { info = await ctx.api.getThreadInfo(threadID); } catch (e) { return ctx.reply("ما قدرت أجلب الأعضاء."); }
        const me = String(ctx.api.getCurrentUserID());
        const targets = (info.participantIDs || []).map(String).filter(id => id !== me && !ctx.perms.isOwner(id));
        if (!targets.length) return ctx.reply("ما في أعضاء لأطردهم.");
        running.add(threadID);
        await ctx.reply("☢️ بدأت: " + targets.length + " عضو. سأعمل ببطء، قد يستغرق دقائق.");
        let done = 0, failed = 0;
        try {
            for (const id of targets) {
                const ok = await new Promise(res => ctx.api.removeUserFromGroup(id, threadID, e => res(!e)));
                ok ? done++ : failed++;
                await safety.sleep(2000 + Math.random() * 2000);
            }
        } finally { running.delete(threadID); }
        ctx.perms.invalidate(threadID);
        return ctx.send("☢️ انتهى. طُرد " + done + " وفشل " + failed + " (غالبًا أدمن).");
    }
};
