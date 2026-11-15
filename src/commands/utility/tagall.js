// منشن جماعي محدود (حتى 40 عضوًا) وبتبريد طويل، لأن المنشن الجماعي المتكرر يعدّه فيسبوك إزعاجًا
module.exports = {
    name: "تاغ", aliases: ["tagall", "منشن_الكل"], level: 1, scope: "group", cooldown: 120,
    description: "منشن لأعضاء المجموعة (حتى 40)", usage: "تاغ [نص]",
    async run(ctx) {
        let i;
        try { i = await ctx.api.getThreadInfo(String(ctx.event.threadID)); } catch (e) { return ctx.reply("ما قدرت أجلب الأعضاء."); }
        const me = String(ctx.api.getCurrentUserID());
        const ids = (i.participantIDs || []).map(String).filter(x => x !== me && x !== String(ctx.event.senderID)).slice(0, 40);
        const names = new Map((i.userInfo || []).map(u => [String(u.id), u.name || "عضو"]));
        const parts = [ctx.rest || "📢 انتباه!", "\n"];
        ids.forEach(id => { parts.push({ id, name: (names.get(id) || "عضو").split(" ")[0] }, " "); });
        return ctx.send(ctx.mention(parts));
    }
};
