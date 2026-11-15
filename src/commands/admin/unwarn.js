module.exports = {
    name: "ازالة_تحذير", aliases: ["الغاء_تحذير", "unwarn"], level: 1, scope: "group", cooldown: 3,
    description: "إزالة تحذير من عضو", usage: "ازالة_تحذير @منشن",
    async run(ctx) {
        const t = await ctx.target();
        if (!t) return ctx.reply("حدد العضو بمنشن أو برد على رسالته.");
        const key = "warn:" + ctx.event.threadID + ":" + t.id;
        const n = ctx.store.get(key, 0) || 0;
        if (!n) return ctx.reply("ما عنده تحذيرات.");
        ctx.store.set(key, n - 1);
        return ctx.reply("تمت إزالة تحذير. المتبقي " + (n - 1) + " 🌸");
    }
};
