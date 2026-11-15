module.exports = {
    name: "بوت", aliases: ["ownermode"], level: 2, cooldown: 2,
    description: "تشغيل/إيقاف استجابة البوت للجميع (المطوّر فقط يبقى)", usage: "بوت تشغيل | بوت ايقاف",
    async run(ctx) {
        const a = ctx.args[0] || "";
        if (/^(ايقاف|إيقاف|off)$/.test(a)) { ctx.store.set("ownerMode", true); return ctx.reply("تم: لن أستجيب إلا للمطوّر."); }
        if (/^(تشغيل|on)$/.test(a)) { ctx.store.del("ownerMode"); return ctx.reply("رجعت أستجيب للجميع 🌸"); }
        return ctx.reply("الحالة: " + (ctx.store.get("ownerMode") ? "للمطوّر فقط" : "للجميع") + "\nبوت تشغيل | بوت ايقاف");
    }
};
