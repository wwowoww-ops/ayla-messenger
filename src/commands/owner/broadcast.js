// إذاعة بطيئة (4-8 ثوان بين كل مجموعة) وبحد أقصى، حتى لا يعدّها فيسبوك رسائل جماعية آلية
const safety = require("../../lib/safety");
const MAX_THREADS = 25;
module.exports = {
    name: "اذاعة", aliases: ["broadcast"], level: 2, cooldown: 60,
    description: "إرسال رسالة إلى المجموعات (حتى 25 مجموعة وبفاصل بطيء)", usage: "اذاعة النص",
    async run(ctx) {
        const msg = ctx.rest;
        if (!msg) return ctx.reply("اكتب نص الإذاعة بعد الأمر.");
        let list = [];
        try { list = await new Promise((res, rej) => ctx.api.getThreadList(MAX_THREADS, null, ["INBOX"], (e, l) => e ? rej(e) : res(l || []))); } catch (e) { return ctx.reply("ما قدرت أجلب المجموعات."); }
        const groups = list.filter(t => t.isGroup && !ctx.store.get("ban:t:" + t.threadID)).slice(0, MAX_THREADS);
        await ctx.reply("جاري الإرسال إلى " + groups.length + " مجموعة ببطء، قد يستغرق دقائق 🌸");
        let ok = 0;
        for (const g of groups) {
            const r = await ctx.send(msg, g.threadID);
            if (r) ok++;
            await safety.sleep(4000 + Math.random() * 4000);
        }
        return ctx.reply("اكتملت الإذاعة: " + ok + "/" + groups.length);
    }
};
