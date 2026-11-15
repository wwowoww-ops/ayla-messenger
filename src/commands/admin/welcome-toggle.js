module.exports = {
    name: "ترحيب", aliases: ["welcome"], level: 1, scope: "group", cooldown: 3,
    description: "تشغيل/إيقاف رسالة الترحيب بالأعضاء الجدد", usage: "ترحيب تشغيل | ترحيب ايقاف",
    async run(ctx) {
        const k = "welcome:off:" + ctx.event.threadID, a = ctx.args[0] || "";
        if (/^(ايقاف|إيقاف|off)$/.test(a)) { ctx.store.set(k, true); return ctx.reply("تم إيقاف الترحيب."); }
        if (/^(تشغيل|on)$/.test(a)) { ctx.store.del(k); return ctx.reply("تم تشغيل الترحيب 🌸"); }
        return ctx.reply("الترحيب: " + (ctx.store.get(k) ? "متوقف" : "مفعّل") + "\nترحيب تشغيل | ترحيب ايقاف");
    }
};
