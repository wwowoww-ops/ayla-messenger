// إذاعة بطيئة (4-8 ثوان بين كل مجموعة) وبحد أقصى، حتى لا يعدّها فيسبوك رسائل جماعية آلية
const safety = require("../../lib/safety");
const MAX_THREADS = 25;
module.exports = {
    name: "اذاعة", aliases: ["broadcast"], level: 2, cooldown: 60,
    description: "إرسال رسالة إلى المجموعات (حتى 25 مجموعة وبفاصل بطيء)", usage: "اذاعة النص",
    async run(ctx) {
        const msg = ctx.rest;
        if (!msg) return ctx.reply("❌ لم تكتب نص الإذاعة\n↳ " + ctx.prefix + "اذاعة نص الرسالة");
        let list = [];
        try { list = await new Promise((res, rej) => ctx.api.getThreadList(MAX_THREADS, null, ["INBOX"], (e, l) => e ? rej(e) : res(l || []))); } catch (e) { return ctx.reply("❌ تعذّر جلب قائمة المجموعات الآن\n↳ حاول بعد قليل."); }
        const groups = list.filter(t => t.isGroup && !ctx.store.get("ban:t:" + t.threadID)).slice(0, MAX_THREADS);
        await ctx.reply("📢 بدأت الإذاعة\n👥 عدد المجموعات: " + groups.length + "\n⏳ أرسل ببطء لحماية الحساب، وقد يستغرق ذلك دقائق.");
        let ok = 0;
        for (const g of groups) {
            const r = await ctx.send(msg, g.threadID);
            if (r) ok++;
            await safety.sleep(4000 + Math.random() * 4000);
        }
        return ctx.reply("✅ اكتملت الإذاعة\n📨 وصلت: " + ok + " من " + groups.length + " مجموعة\n" + (ok < groups.length ? "⚠️ بعض المجموعات تعذّر الإرسال إليها (ربما أُخرجتُ منها)." : "🎉 وصلت إلى الجميع."));
    }
};
