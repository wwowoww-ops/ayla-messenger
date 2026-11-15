const safety = require("../../lib/safety");
module.exports = {
    name: "خفض_ادمن", aliases: ["انزل", "demote"], level: 1, scope: "group", cooldown: 5,
    description: "سحب الأدمن من عضو", usage: "خفض_ادمن @منشن",
    async run(ctx) {
        const t = await ctx.target();
        if (!t) return ctx.reply("❌ لم تحدد العضو\n↳ استعمل منشن: " + ctx.prefix + "خفض_ادمن @العضو\n↳ أو ردّ على رسالته بالأمر نفسه");
        if (ctx.perms.isOwner(t.id)) return ctx.reply("🛡️ لا أستطيع سحب الإدارة من هذا الشخص\n↳ هو مطوّر البوت.");
        if (!(await ctx.perms.botIsAdmin(ctx.api, ctx.event.threadID))) return ctx.reply("⚠️ لا أملك صلاحية الأدمن في هذه المجموعة\n↳ اجعلني أدمن أولًا ثم أعد المحاولة.");
        if (!safety.allowAction()) return ctx.reply("⏳ نفّذتُ أفعالًا إدارية كثيرة مؤخرًا\n↳ أنتظر دقيقة لحماية الحساب، ثم أعد المحاولة.");
        ctx.api.changeAdminStatus(String(ctx.event.threadID), t.id, false, err => { ctx.perms.invalidate(ctx.event.threadID); ctx.reply(err ? "❌ فشل سحب الإدارة\n↳ تأكد أنني أدمن وأن العضو ليس منشئ المجموعة." : ctx.mention(["✅ تم سحب الإدارة\n👤 ", { id: t.id, name: t.name }, "\n📌 أصبح عضوًا عاديًا في المجموعة."])); });
    }
};
