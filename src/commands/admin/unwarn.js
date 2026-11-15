module.exports = {
    name: "ازالة_تحذير", aliases: ["الغاء_تحذير", "unwarn"], level: 1, scope: "group", cooldown: 3,
    description: "إزالة تحذير من عضو", usage: "ازالة_تحذير @منشن",
    async run(ctx) {
        const t = await ctx.target();
        if (!t) return ctx.reply("❌ لم تحدد العضو\n↳ " + ctx.prefix + "ازالة_تحذير @العضو\n↳ أو ردّ على رسالته بالأمر نفسه");
        const key = "warn:" + ctx.event.threadID + ":" + t.id;
        const n = ctx.store.get(key, 0) || 0;
        if (!n) return ctx.reply("ℹ️ هذا العضو ليس لديه أي تحذيرات لإزالتها.");
        ctx.store.set(key, n - 1);
        return ctx.reply(ctx.mention(["✅ تمت إزالة تحذير\n👤 ", { id: t.id, name: t.name }, "\n🔢 التحذيرات المتبقية: " + (n - 1) + "/3"]));
    }
};
