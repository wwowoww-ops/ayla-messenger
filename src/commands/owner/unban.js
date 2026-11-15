module.exports = {
    name: "فك_حظر", aliases: ["unban"], level: 2, cooldown: 2,
    description: "فك حظر مستخدم أو مجموعة", usage: "فك_حظر @منشن | فك_حظر هنا",
    async run(ctx) {
        if (/^(هنا|المجموعة)$/.test(ctx.args[0] || "")) { ctx.store.del("ban:t:" + ctx.event.threadID); return ctx.reply("✅ تم فك حظر هذه المجموعة\n↳ أستجيب الآن لأعضائها من جديد."); }
        const t = await ctx.target();
        if (!t) return ctx.reply("❌ لم تحدد الشخص\n↳ منشن، أو ردّ على رسالته، أو اكتب الـ ID\n↳ أو اكتب «هنا» لفك حظر المجموعة الحالية");
        ctx.store.del("ban:u:" + t.id);
        return ctx.reply(ctx.mention(["✅ تم فك الحظر\n👤 ", { id: t.id, name: t.name }, "\n🆔 " + t.id + "\n📌 يستطيع استعمال البوت من جديد."]));
    }
};
