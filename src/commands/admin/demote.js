const safety = require("../../lib/safety");
module.exports = {
    name: "خفض_ادمن", aliases: ["انزل", "demote"], level: 1, scope: "group", cooldown: 5,
    description: "سحب الأدمن من عضو", usage: "خفض_ادمن @منشن",
    async run(ctx) {
        const t = await ctx.target();
        if (!t) return ctx.reply("حدد العضو بمنشن أو برد على رسالته.");
        if (ctx.perms.isOwner(t.id)) return ctx.reply("لا أستطيع سحب الأدمن من هذا الشخص.");
        if (!(await ctx.perms.botIsAdmin(ctx.api, ctx.event.threadID))) return ctx.reply("لازم أكون أدمن أولًا 🌸");
        if (!safety.allowAction()) return ctx.reply("جرّب بعد دقيقة.");
        ctx.api.changeAdminStatus(String(ctx.event.threadID), t.id, false, err => { ctx.perms.invalidate(ctx.event.threadID); ctx.reply(err ? "ما قدرت أسحب الصلاحية." : "تم سحب الأدمن."); });
    }
};
