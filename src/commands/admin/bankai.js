const safety = require("../../lib/safety");
module.exports = {
    name: "بانكاي", aliases: ["bankai"], level: 1, scope: "group", cooldown: 10,
    description: "طرد عضو بمشهد بانكاي", usage: "بانكاي @منشن | بالرد على رسالته",
    async run(ctx) {
        const t = await ctx.target();
        if (!t) return ctx.reply("حدد العضو بمنشن أو برد على رسالته.");
        if (ctx.perms.isOwner(t.id) || t.id === String(ctx.api.getCurrentUserID())) return ctx.reply("هذا الشخص خارج المعركة 🌸");
        if (!(await ctx.perms.botIsAdmin(ctx.api, ctx.event.threadID))) return ctx.reply("لازم أكون أدمن حتى أستعمل البانكاي 🌸");
        if (!safety.allowAction()) return ctx.reply("جرّب بعد دقيقة.");
        await ctx.send(ctx.mention(["⚔️ بانكاي… أونوهانا! ", { id: t.id, name: t.name }, " هذه نهاية الطريق."]));
        await safety.sleep(2500);
        ctx.api.removeUserFromGroup(t.id, String(ctx.event.threadID), err => { if (err) ctx.send("البانكاي فشل (ربما هو أدمن)."); });
    }
};
