module.exports = {
    name: "بوت", aliases: ["ownermode"], level: 2, cooldown: 2,
    description: "تشغيل/إيقاف استجابة البوت للجميع (المطوّر فقط يبقى)", usage: "بوت تشغيل | بوت ايقاف",
    async run(ctx) {
        const a = ctx.args[0] || "";
        if (/^(ايقاف|إيقاف|off)$/.test(a)) { ctx.store.set("ownerMode", true); return ctx.reply("🔒 وضع المطوّر مفعّل\n↳ لن أستجيب إلا للمطوّرين في كل المحادثات.\n↳ للعودة: " + ctx.prefix + "بوت تشغيل"); }
        if (/^(تشغيل|on)$/.test(a)) { ctx.store.del("ownerMode"); return ctx.reply("🔓 تم إيقاف وضع المطوّر\n↳ أستجيب الآن للجميع."); }
        return ctx.reply("🤖 حالة البوت: " + (ctx.store.get("ownerMode") ? "للمطوّر فقط 🔒" : "للجميع 🔓") + "\n━━━━━━━━━━━━━━━━━━\n↳ " + ctx.prefix + "بوت تشغيل → يستجيب للجميع\n↳ " + ctx.prefix + "بوت ايقاف → للمطوّر فقط");
    }
};
