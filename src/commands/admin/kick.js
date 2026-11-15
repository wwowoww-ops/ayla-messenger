const safety = require("../../lib/safety");
module.exports = {
    name: "طرد", aliases: ["اطرد", "kick"], level: 1, scope: "group", cooldown: 5,
    description: "طرد عضو من المجموعة", usage: "طرد @منشن | بالرد على رسالته",
    async run(ctx) {
        const t = await ctx.target();
        if (!t) return ctx.reply("حدد العضو بمنشن أو برد على رسالته.");
        if (ctx.perms.isOwner(t.id) || t.id === String(ctx.api.getCurrentUserID())) return ctx.reply("لا أستطيع طرد هذا الشخص.");
        if (!(await ctx.perms.botIsAdmin(ctx.api, ctx.event.threadID))) return ctx.reply("لازم أكون أدمن في المجموعة لأطرد 🌸");
        if (!safety.allowAction()) return ctx.reply("أعمل على أفعال كثيرة الآن، جرّب بعد دقيقة.");
        ctx.api.removeUserFromGroup(t.id, String(ctx.event.threadID), err => { if (err) ctx.reply("ما قدرت أطرده (ربما هو أدمن)."); });
    }
};
