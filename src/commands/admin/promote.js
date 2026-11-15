const safety = require("../../lib/safety");
async function run(ctx, make) {
    const t = await ctx.target();
    if (!t) return ctx.reply("حدد العضو بمنشن أو برد على رسالته.");
    if (!(await ctx.perms.botIsAdmin(ctx.api, ctx.event.threadID))) return ctx.reply("لازم أكون أدمن أولًا 🌸");
    if (!safety.allowAction()) return ctx.reply("جرّب بعد دقيقة.");
    ctx.api.changeAdminStatus(String(ctx.event.threadID), t.id, make, err => {
        ctx.perms.invalidate(ctx.event.threadID);
        ctx.reply(err ? "ما قدرت أغيّر الصلاحية." : make ? "تمت الترقية إلى أدمن 🌸" : "تم سحب الأدمن.");
    });
}
module.exports = {
    name: "رفع_ادمن", aliases: ["ارفع", "promote"], level: 1, scope: "group", cooldown: 5,
    description: "ترقية عضو إلى أدمن", usage: "رفع_ادمن @منشن",
    run: ctx => run(ctx, true)
};
