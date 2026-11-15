module.exports = {
    name: "قول", aliases: ["say"], level: 0, cooldown: 10,
    description: "أقول ما تكتبه", usage: "قول النص",
    async run(ctx) {
        const t = ctx.rest.trim();
        if (!t) return ctx.reply("اكتب ما تريدني أقوله.");
        return ctx.send(t.slice(0, 400));
    }
};
