module.exports = {
    name: "معلومات", aliases: ["info"], level: 0, scope: "group", cooldown: 10,
    description: "معلومات المجموعة", usage: "معلومات",
    async run(ctx) {
        let i;
        try { i = await ctx.api.getThreadInfo(String(ctx.event.threadID)); } catch (e) { return ctx.reply("❌ تعذّر جلب معلومات المجموعة الآن\n↳ حاول بعد قليل."); }
        const members = (i.participantIDs || []).length;
        return ctx.reply("📌 معلومات المجموعة\n━━━━━━━━━━━━━━━━━━\n🏷️ الاسم: " + (i.threadName || "بدون اسم") + "\n🆔 المعرّف: " + ctx.event.threadID + "\n👥 الأعضاء: " + members + "\n🛡️ الأدمن: " + (i.adminIDs || []).length + "\n😀 الإيموجي: " + (i.emoji || "—") + "\n🔖 البادئة: «" + (ctx.prefix || "بدون") + "»");
    }
};
