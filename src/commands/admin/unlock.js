// فتح: إلغاء القفل (يعيد الاستجابة لجميع الأعضاء)
module.exports = {
    name: "فتح", aliases: ["unlock"], level: 1, scope: "group", cooldown: 3,
    description: "فتح المجموعة بعد القفل: أستجيب لجميع الأعضاء", usage: "فتح",
    async run(ctx) {
        const k = "restrict:" + ctx.event.threadID;
        if (!ctx.store.get(k)) return ctx.reply("🔓 المجموعة مفتوحة أصلًا\n↳ لقفلها اكتب: " + ctx.prefix + "قفل");
        ctx.store.del(k);
        return ctx.reply("🔓 تم فتح المجموعة\n↳ أستجيب الآن لجميع الأعضاء 🌸");
    }
};
