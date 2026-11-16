// قفل: يجعل البوت يستجيب للأدمن والمطوّرين فقط (نفس مفتاح «تقييد»)
module.exports = {
    name: "قفل", aliases: ["lock"], level: 1, scope: "group", cooldown: 3,
    description: "قفل المجموعة: لا أستجيب إلا للأدمن والمطوّرين", usage: "قفل",
    async run(ctx) {
        const k = "restrict:" + ctx.event.threadID;
        if (ctx.store.get(k)) return ctx.reply("🔒 المجموعة مقفلة بالفعل\n↳ لفتحها اكتب: " + ctx.prefix + "فتح");
        ctx.store.set(k, true);
        return ctx.reply("🔒 تم قفل المجموعة\n━━━━━━━━━━━━━━━━━━\n↳ لن أستجيب إلا لأدمن المجموعة والمطوّرين.\n↳ لفتحها اكتب: " + ctx.prefix + "فتح");
    }
};
