module.exports = {
    name: "رست", aliases: ["restart"], level: 2, cooldown: 30,
    description: "إعادة تشغيل البوت", usage: "رست",
    async run(ctx) {
        await ctx.reply("أعيد التشغيل... 🌸");
        await ctx.store.flush();
        setTimeout(() => process.exit(0), 1500);
    }
};
