module.exports = {
    name: "فك_حظر", aliases: ["unban"], level: 2, cooldown: 2,
    description: "فك حظر مستخدم أو مجموعة", usage: "فك_حظر @منشن | فك_حظر هنا",
    async run(ctx) {
        if (/^(هنا|المجموعة)$/.test(ctx.args[0] || "")) { ctx.store.del("ban:t:" + ctx.event.threadID); return ctx.reply("تم فك حظر هذه المجموعة."); }
        const t = await ctx.target();
        if (!t) return ctx.reply("حدد الشخص بمنشن أو رد أو ID.");
        ctx.store.del("ban:u:" + t.id);
        return ctx.reply("تم فك حظر " + t.name + ".");
    }
};
