module.exports = {
    name: "تقييد", aliases: ["restrict"], level: 1, scope: "group", cooldown: 3,
    description: "جعل البوت يستجيب للأدمن فقط في هذه المجموعة", usage: "تقييد | (مرة ثانية لإلغاء التقييد)",
    async run(ctx) {
        const k = "restrict:" + ctx.event.threadID;
        if (ctx.store.get(k)) { ctx.store.del(k); return ctx.reply("🔓 تم إلغاء التقييد\n↳ أستجيب الآن لجميع الأعضاء."); }
        ctx.store.set(k, true); return ctx.reply("🔒 تم تقييد البوت\n↳ لن أستجيب إلا لأدمن المجموعة والمطوّرين.\n↳ لإلغاء التقييد أعد كتابة: " + ctx.prefix + "تقييد");
    }
};
