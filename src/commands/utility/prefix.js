// البادئة لكل مجموعة، وتُحفظ فعلًا في التخزين
module.exports = {
    name: "بادئة", aliases: ["prefix"], level: 0, cooldown: 3,
    description: "عرض بادئة البوت أو تغييرها (للأدمن)", usage: "بادئة | بادئة ! | بادئة بدون",
    async run(ctx) {
        const a = ctx.args[0];
        if (!a) return ctx.reply("بادئتي هنا: «" + (ctx.prefix || "بدون") + "»");
        if (ctx.event.isGroup && ctx.level < 1 && !ctx.isOwner) {
            const lv = await ctx.perms.levelOf(ctx.api, ctx.event);
            if (lv < 1) return ctx.reply("تغيير البادئة لأدمن المجموعة فقط.");
        }
        if (a.length > 3) return ctx.reply("البادئة رمز قصير (حتى 3 حروف).");
        ctx.store.set("prefix:" + ctx.event.threadID, a === "بدون" ? "" : a);
        return ctx.reply("تم. البادئة الآن: «" + (a === "بدون" ? "بدون" : a) + "» 🌸");
    }
};
