module.exports = {
    name: "قول", aliases: ["say"], level: 0, cooldown: 10,
    description: "أقول ما تكتبه", usage: "قول النص",
    async run(ctx) {
        const t = ctx.rest.trim();
        if (!t) return ctx.reply("❌ لم تكتب شيئًا\n↳ " + ctx.prefix + "قول النص الذي تريدني أن أقوله");
        // حذف رسالة الأمر إن سمح فيسبوك (غالبًا يعمل لرسائل البوت فقط، لذا المحاولة صامتة)
        try { ctx.api.unsendMessage(ctx.event.messageID, () => {}); } catch (e) { /* لا شيء */ }
        return ctx.send(t.slice(0, 400));
    }
};
