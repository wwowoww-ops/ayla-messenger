// خمن: لعبة تخمين رقم من 1 إلى 100 لكل محادثة. "خمن" تبدأ، "خمن 42" تخمّن.
const { pick } = require("../../lib/util");
module.exports = {
    name: "خمن", aliases: ["guess"], level: 0, scope: "group", cooldown: 2,
    description: "لعبة تخمين رقم من 1 إلى 100", usage: "خمن | خمن <رقم>",
    async run(ctx) {
        const key = "guess:" + ctx.event.threadID;
        const n = parseInt(String(ctx.args[0] || "").replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)), 10);
        let g = ctx.store.get(key);
        if (Number.isNaN(n)) {
            g = { n: 1 + Math.floor(Math.random() * 100), tries: 0 };
            ctx.store.set(key, g);
            return ctx.reply("🎯 فكّرت برقم من 1 إلى 100. خمّن بكتابة: " + ctx.prefix + "خمن 50");
        }
        if (!g) return ctx.reply("ابدأ لعبة أولًا بكتابة: " + ctx.prefix + "خمن");
        g.tries++;
        if (n === g.n) {
            ctx.store.del(key);
            return ctx.send(ctx.mention(["🎉 ", { id: ctx.event.senderID, name: await ctx.nameOf(ctx.event.senderID) }, " خمّن الرقم " + g.n + " بعد " + g.tries + " محاولة! " + pick(["ذكي 🌸", "ما شاء الله 💖"])]));
        }
        ctx.store.set(key, g);
        return ctx.reply(n < g.n ? "⬆️ الرقم أكبر" : "⬇️ الرقم أصغر");
    }
};
