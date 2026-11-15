const safety = require("../../lib/safety");
async function run(ctx, make) {
    const t = await ctx.target();
    if (!t) return ctx.reply("❌ لم تحدد العضو\n↳ استعمل منشن: " + ctx.prefix + "رفع_ادمن @العضو\n↳ أو ردّ على رسالته بالأمر نفسه");
    if (!(await ctx.perms.botIsAdmin(ctx.api, ctx.event.threadID))) return ctx.reply("⚠️ لا أملك صلاحية الأدمن في هذه المجموعة\n↳ اجعلني أدمن أولًا ثم أعد المحاولة.");
    if (!safety.allowAction()) return ctx.reply("⏳ نفّذتُ أفعالًا إدارية كثيرة مؤخرًا\n↳ أنتظر دقيقة لحماية الحساب، ثم أعد المحاولة.");
    ctx.api.changeAdminStatus(String(ctx.event.threadID), t.id, make, err => {
        ctx.perms.invalidate(ctx.event.threadID);
        ctx.reply(err ? "❌ فشل تغيير الصلاحية\n↳ تأكد أنني أدمن وأن العضو موجود في المجموعة." : ctx.mention(["✅ تمت الترقية إلى أدمن\n👤 ", { id: t.id, name: t.name }, "\n📌 أصبح مشرفًا في المجموعة."]));
    });
}
module.exports = {
    name: "رفع_ادمن", aliases: ["ارفع", "promote"], level: 1, scope: "group", cooldown: 5,
    description: "ترقية عضو إلى أدمن", usage: "رفع_ادمن @منشن",
    run: ctx => run(ctx, true)
};
