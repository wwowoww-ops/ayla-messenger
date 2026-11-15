// تحذير عضو: عند الوصول إلى 3 تحذيرات يُطرد إن كان البوت أدمن
const safety = require("../../lib/safety");
const MAX = 3;
module.exports = {
    name: "تحذير", aliases: ["انذار", "warn"], level: 1, scope: "group", cooldown: 3,
    description: "تحذير عضو (3 تحذيرات = طرد)", usage: "تحذير @منشن [السبب] | أو بالرد على رسالته",
    async run(ctx) {
        const t = await ctx.target();
        if (!t) return ctx.reply("حدد العضو: تحذير @منشن، أو ردّ على رسالته.");
        if (ctx.perms.isOwner(t.id) || t.id === String(ctx.api.getCurrentUserID())) return ctx.reply("ما أقدر أحذّر هذا الشخص 🌸");
        const key = "warn:" + ctx.event.threadID + ":" + t.id;
        const n = (ctx.store.get(key, 0) || 0) + 1;
        const reason = ctx.text();
        if (n >= MAX) {
            ctx.store.del(key);
            if (await ctx.perms.botIsAdmin(ctx.api, ctx.event.threadID) && safety.allowAction()) {
                await ctx.send(ctx.mention([{ id: t.id, name: t.name }, " وصل 3 تحذيرات وسيُطرد."]));
                return ctx.api.removeUserFromGroup(t.id, String(ctx.event.threadID), () => {});
            }
            return ctx.send(ctx.mention([{ id: t.id, name: t.name }, " وصل 3 تحذيرات، لكن لا أستطيع طرده (لست أدمن أو الحد مؤقتًا)."]));
        }
        ctx.store.set(key, n);
        return ctx.send(ctx.mention(["⚠️ ", { id: t.id, name: t.name }, " تحذير " + n + "/" + MAX + (reason ? "\nالسبب: " + reason : "")]));
    }
};
