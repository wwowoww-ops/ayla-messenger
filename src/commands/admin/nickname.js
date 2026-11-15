const safety = require("../../lib/safety");
module.exports = {
    name: "كنية", aliases: ["لقب", "nick"], level: 1, scope: "group", cooldown: 5,
    description: "تغيير كنية عضو", usage: "كنية @منشن الكنية الجديدة | بالرد: كنية الكنية",
    async run(ctx) {
        const t = await ctx.target();
        const nick = ctx.text();
        if (!t || !nick) return ctx.reply("❌ الاستعمال غير صحيح\n↳ " + ctx.prefix + "كنية @العضو الكنية_الجديدة\n↳ أو ردّ على رسالته: " + ctx.prefix + "كنية الكنية_الجديدة");
        if (!safety.allowAction()) return ctx.reply("⏳ نفّذتُ أفعالًا كثيرة مؤخرًا\n↳ أنتظر دقيقة لحماية الحساب، ثم أعد المحاولة.");
        ctx.api.changeNickname(nick.slice(0, 40), String(ctx.event.threadID), t.id, err => ctx.reply(err ? "❌ فشل تغيير الكنية\n↳ تأكد أن للعضو حسابًا نشطًا في المجموعة." : ctx.mention(["✅ تم تغيير الكنية\n👤 ", { id: t.id, name: t.name }, "\n🏷️ الكنية الجديدة: " + nick.slice(0, 40)])));
    }
};
