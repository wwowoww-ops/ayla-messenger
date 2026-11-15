module.exports = {
    name: "غادري", aliases: ["leave"], level: 2, scope: "group", cooldown: 5,
    description: "مغادرة البوت للمجموعة الحالية", usage: "غادري",
    async run(ctx) {
        await ctx.reply("مع السلامة 🌸");
        ctx.api.removeUserFromGroup(String(ctx.api.getCurrentUserID()), String(ctx.event.threadID), () => {});
    }
};
