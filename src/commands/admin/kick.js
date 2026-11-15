const safety = require("../../lib/safety");
module.exports = {
    name: "طرد", aliases: ["اطرد", "kick"], level: 1, scope: "group", cooldown: 5,
    description: "طرد عضو من المجموعة", usage: "طرد @منشن | بالرد على رسالته",
    async run(ctx) {
        const t = await ctx.target();
        if (!t) return ctx.reply("❌ لم تحدد العضو\n↳ استعمل منشن: " + ctx.prefix + "طرد @العضو\n↳ أو ردّ على رسالته بالأمر نفسه");
        if (ctx.perms.isOwner(t.id) || t.id === String(ctx.api.getCurrentUserID())) return ctx.reply("🛡️ لا أستطيع طرد هذا الشخص\n↳ هو مطوّر البوت أو البوت نفسه.");
        if (!(await ctx.perms.botIsAdmin(ctx.api, ctx.event.threadID))) return ctx.reply("⚠️ لا أملك صلاحية الأدمن في هذه المجموعة\n↳ اجعلني أدمن حتى أستطيع الطرد.");
        if (!safety.allowAction()) return ctx.reply("⏳ نفّذتُ أفعالًا إدارية كثيرة مؤخرًا\n↳ أنتظر دقيقة لحماية الحساب، ثم أعد المحاولة.");
        ctx.api.removeUserFromGroup(t.id, String(ctx.event.threadID), err => { if (err) ctx.reply("❌ فشل الطرد\n↳ غالبًا لأن العضو أدمن في المجموعة.");
            else ctx.send(ctx.mention(["🚫 تم الطرد\n👤 ", { id: t.id, name: t.name }, "\n📌 بقرار من الإدارة."])); });
    }
};
