module.exports = {
    name: "معلومات", aliases: ["info", "تيد"], level: 0, scope: "group", cooldown: 10,
    description: "معلومات المجموعة", usage: "معلومات",
    async run(ctx) {
        let i;
        try { i = await ctx.api.getThreadInfo(String(ctx.event.threadID)); } catch (e) { return ctx.reply("ما قدرت أجلب معلومات المجموعة."); }
        const members = (i.participantIDs || []).length;
        return ctx.reply("📌 " + (i.threadName || "بدون اسم") + "\n👥 الأعضاء: " + members + "\n🛡️ الأدمن: " + (i.adminIDs || []).length + "\n🔖 البادئة: «" + (ctx.prefix || "بدون") + "»");
    }
};
