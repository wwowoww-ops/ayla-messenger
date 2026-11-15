module.exports = {
    name: "حظر", aliases: ["ban"], level: 2, cooldown: 2,
    description: "حظر مستخدم أو المجموعة الحالية من استعمال البوت", usage: "حظر @منشن | حظر هنا | فك_حظر ...",
    async run(ctx) {
        if (/^(هنا|المجموعة)$/.test(ctx.args[0] || "")) { ctx.store.set("ban:t:" + ctx.event.threadID, true); return ctx.reply("تم حظر هذه المجموعة."); }
        const t = await ctx.target();
        if (!t) return ctx.reply("حدد الشخص بمنشن أو رد أو ID.");
        if (ctx.perms.isOwner(t.id)) return ctx.reply("لا يمكن حظر مطوّر.");
        ctx.store.set("ban:u:" + t.id, true);
        return ctx.reply("تم حظر " + t.name + " من استعمال البوت.");
    }
};
