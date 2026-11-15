// تحذير عضو: عند الوصول إلى 3 تحذيرات يُطرد إن كان البوت أدمن
const safety = require("../../lib/safety");
const MAX = 3;
module.exports = {
    name: "تحذير", aliases: ["انذار", "warn"], level: 1, scope: "group", cooldown: 3,
    description: "تحذير عضو (3 تحذيرات = طرد)", usage: "تحذير @منشن [السبب] | أو بالرد على رسالته",
    async run(ctx) {
        const t = await ctx.target();
        if (!t) return ctx.reply("❌ لم تحدد العضو\n↳ " + ctx.prefix + "تحذير @العضو [السبب]\n↳ أو ردّ على رسالته بالأمر نفسه");
        if (ctx.perms.isOwner(t.id) || t.id === String(ctx.api.getCurrentUserID())) return ctx.reply("🛡️ لا أستطيع تحذير هذا الشخص\n↳ هو مطوّر البوت أو البوت نفسه.");
        const key = "warn:" + ctx.event.threadID + ":" + t.id;
        const n = (ctx.store.get(key, 0) || 0) + 1;
        const reason = ctx.text();
        if (n >= MAX) {
            ctx.store.del(key);
            if (await ctx.perms.botIsAdmin(ctx.api, ctx.event.threadID) && safety.allowAction()) {
                await ctx.send(ctx.mention([{ id: t.id, name: t.name }, "\n⚠️ وصل 3 تحذيرات\n🚫 سيُطرد الآن من المجموعة" + (reason ? "\n📋 آخر سبب: " + reason : "")]));
                return ctx.api.removeUserFromGroup(t.id, String(ctx.event.threadID), () => {});
            }
            return ctx.send(ctx.mention([{ id: t.id, name: t.name }, "\n⚠️ وصل 3 تحذيرات\n❌ لا أستطيع طرده الآن (لست أدمن في المجموعة، أو وصلتُ لحد الأفعال المؤقت)" + (reason ? "\n📋 آخر سبب: " + reason : "")]));
        }
        ctx.store.set(key, n);
        return ctx.send(ctx.mention(["⚠️ تم إعطاء تحذير\n👤 ", { id: t.id, name: t.name }, "\n📌 السبب: " + (reason || "غير مذكور") + "\n🔢 عدد التحذيرات: " + n + "/" + MAX + (n === MAX - 1 ? "\n❗ التحذير القادم = طرد" : "")]));
    }
};
