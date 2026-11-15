const START = Date.now();
module.exports = {
    name: "ابتايم", aliases: ["uptime"], level: 0, cooldown: 10,
    description: "مدة التشغيل واستهلاك الذاكرة", usage: "ابتايم",
    async run(ctx) {
        const s = Math.floor((Date.now() - START) / 1000);
        const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
        return ctx.reply("⏱️ أعمل منذ " + (d ? d + " يوم " : "") + h + " س " + m + " د\n💾 " + Math.round(process.memoryUsage().rss / 1048576) + " MB");
    }
};
