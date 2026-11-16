// قوانين المجموعة: الجميع يعرضها، والأدمن يعيّنها أو يمسحها. تُرسل أيضًا مع ترحيب الأعضاء الجدد.
const L = "━━━━━━━━━━━━━━━━━━";
module.exports = {
    name: "قوانين", aliases: ["القوانين", "rules"], level: 0, scope: "group", cooldown: 5,
    description: "عرض قوانين المجموعة (للأدمن: تعيين / مسح)", usage: "قوانين | قوانين تعيين <النص> | قوانين مسح",
    async run(ctx) {
        const tid = String(ctx.event.threadID), p = ctx.prefix, k = "rules:" + tid;
        const sub = ctx.args[0] || "";
        if (/^(تعيين|تحديد|set)$/.test(sub) || /^(مسح|حذف|clear)$/.test(sub)) {
            const lv = await ctx.perms.levelOf(ctx.api, ctx.event);
            if (lv < 1) return ctx.reply("🛡️ تعيين القوانين مخصّص لأدمن المجموعة فقط.");
            if (/^(مسح|حذف|clear)$/.test(sub)) { ctx.store.del(k); return ctx.reply("🗑️ تم مسح قوانين المجموعة."); }
            const text = ctx.args.slice(1).join(" ").trim() || String((ctx.event.messageReply && ctx.event.messageReply.body) || "").trim();
            if (!text) return ctx.reply("📝 اكتب القوانين بعد الأمر، أو ردّ على رسالة فيها القوانين\n↳ " + p + "قوانين تعيين 1- الاحترام 2- ممنوع الروابط");
            if (text.length > 1500) return ctx.reply("❌ النص طويل جدًا\n↳ الحد الأقصى 1500 حرف.");
            ctx.store.set(k, { text, by: String(ctx.event.senderID), at: Date.now() });
            return ctx.reply("✅ تم حفظ قوانين المجموعة\n" + L + "\n" + text + "\n" + L + "\n↳ ستظهر مع ترحيب كل عضو جديد، وتُعرض بالأمر " + p + "قوانين");
        }
        const r = ctx.store.get(k);
        if (!r || !r.text) return ctx.reply("📭 لا توجد قوانين لهذه المجموعة بعد\n↳ الأدمن يكتب: " + p + "قوانين تعيين <النص>");
        return ctx.reply("📜 قوانين المجموعة\n" + L + "\n" + r.text + "\n" + L + "\n↳ الالتزام بها يحفظ الود بيننا 🌸");
    }
};
