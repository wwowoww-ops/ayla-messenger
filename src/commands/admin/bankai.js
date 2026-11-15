const safety = require("../../lib/safety");
module.exports = {
    name: "بانكاي", aliases: ["bankai"], level: 1, scope: "group", cooldown: 10,
    description: "طرد عضو بمشهد بانكاي", usage: "بانكاي @منشن | بالرد على رسالته",
    async run(ctx) {
        const t = await ctx.target();
        if (!t) return ctx.reply("❌ لم تحدد العضو\n↳ استعمل منشن: " + ctx.prefix + "بانكاي @العضو\n↳ أو ردّ على رسالته بالأمر نفسه");
        if (ctx.perms.isOwner(t.id) || t.id === String(ctx.api.getCurrentUserID())) return ctx.reply("🛡️ هذا الشخص محميّ\n↳ لا يمكن استعمال البانكاي على المطوّر أو على البوت.");
        if (!(await ctx.perms.botIsAdmin(ctx.api, ctx.event.threadID))) return ctx.reply("⚠️ لا أملك صلاحية الأدمن في هذه المجموعة\n↳ اجعلني أدمن أولًا ثم أعد المحاولة.");
        if (!safety.allowAction()) return ctx.reply("⏳ نفّذتُ أفعالًا إدارية كثيرة مؤخرًا\n↳ أنتظر دقيقة لحماية الحساب من التقييد، ثم أعد المحاولة.");
        await ctx.send(ctx.mention(["⚔️ بانكاي… أونوهانا! ", { id: t.id, name: t.name }, " هذه نهاية الطريق."]));
        await safety.sleep(2500);
        ctx.api.removeUserFromGroup(t.id, String(ctx.event.threadID), err => { if (err) ctx.send("❌ فشل البانكاي\n↳ غالبًا لأن العضو أدمن في المجموعة ولا أستطيع طرده."); });
    }
};
