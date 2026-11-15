// البادئة لكل مجموعة، وتُحفظ فعلًا في التخزين
module.exports = {
    name: "بادئة", aliases: ["prefix"], level: 0, cooldown: 3,
    description: "عرض بادئة البوت أو تغييرها (للأدمن)", usage: "بادئة | بادئة ! | بادئة بدون",
    async run(ctx) {
        const a = ctx.args[0];
        if (!a) return ctx.reply("🔖 البادئة الحالية: «" + (ctx.prefix || "بدون") + "»\n↳ لتغييرها: " + (ctx.prefix || "") + "بادئة الرمز_الجديد\n↳ للإزالة: " + (ctx.prefix || "") + "بادئة بدون");
        if (ctx.event.isGroup && ctx.level < 1 && !ctx.isOwner) {
            const lv = await ctx.perms.levelOf(ctx.api, ctx.event);
            if (lv < 1) return ctx.reply("🔐 تغيير البادئة مخصّص لأدمن المجموعة فقط.");
        }
        if (a.length > 3) return ctx.reply("❌ البادئة طويلة\n↳ استعمل رمزًا قصيرًا (حتى 3 حروف).");
        ctx.store.set("prefix:" + ctx.event.threadID, a === "بدون" ? "" : a);
        return ctx.reply("✅ تم تغيير البادئة\n🔖 البادئة الجديدة: «" + (a === "بدون" ? "بدون" : a) + "»\n↳ مثال: " + (a === "بدون" ? "" : a) + "اوامر");
    }
};
