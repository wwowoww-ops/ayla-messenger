const safety = require("../../lib/safety");
module.exports = {
    name: "كنية", aliases: ["لقب", "nick"], level: 1, scope: "group", cooldown: 5,
    description: "تغيير كنية عضو", usage: "كنية @منشن الكنية الجديدة | بالرد: كنية الكنية",
    async run(ctx) {
        const t = await ctx.target();
        const nick = ctx.text();
        if (!t || !nick) return ctx.reply("الاستعمال: كنية @منشن الكنية الجديدة (أو بالرد على رسالته).");
        if (!safety.allowAction()) return ctx.reply("جرّب بعد دقيقة.");
        ctx.api.changeNickname(nick.slice(0, 40), String(ctx.event.threadID), t.id, err => ctx.reply(err ? "ما قدرت أغيّر الكنية." : "تم تغيير الكنية 🌸"));
    }
};
