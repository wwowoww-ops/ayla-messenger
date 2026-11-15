module.exports = {
    name: "حظر", aliases: ["ban"], level: 2, cooldown: 2,
    description: "حظر مستخدم أو المجموعة الحالية من استعمال البوت", usage: "حظر @منشن | حظر هنا | فك_حظر ...",
    async run(ctx) {
        if (/^(هنا|المجموعة)$/.test(ctx.args[0] || "")) { ctx.store.set("ban:t:" + ctx.event.threadID, true); return ctx.reply("🚫 تم حظر هذه المجموعة\n↳ لن أستجيب لأي عضو فيها حتى تفك الحظر بـ: " + ctx.prefix + "فك_حظر هنا"); }
        const t = await ctx.target();
        if (!t) return ctx.reply("❌ لم تحدد الشخص\n↳ منشن، أو ردّ على رسالته، أو اكتب الـ ID\n↳ أو اكتب «هنا» لحظر المجموعة الحالية");
        if (ctx.perms.isOwner(t.id)) return ctx.reply("🛡️ لا يمكن حظر مطوّر البوت.");
        ctx.store.set("ban:u:" + t.id, true);
        return ctx.reply(ctx.mention(["🚫 تم الحظر\n👤 ", { id: t.id, name: t.name }, "\n🆔 " + t.id + "\n📌 لن يستطيع استعمال البوت في أي مجموعة."]));
    }
};
