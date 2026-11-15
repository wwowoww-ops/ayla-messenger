module.exports = {
    name: "طلاق", aliases: ["divorce"], level: 0, cooldown: 10,
    description: "إنهاء زواجك الحالي", usage: "طلاق",
    async run(ctx) {
        const me = String(ctx.event.senderID), m = ctx.store.get("marry:" + me);
        if (!m) return ctx.reply("ℹ️ أنت غير متزوج أصلًا\n↳ جرّب: " + ctx.prefix + "زواج @منشن أو " + ctx.prefix + "زوجيني");
        ctx.store.del("marry:" + me); ctx.store.del("marry:" + m.spouse);
        return ctx.reply(ctx.mention(["💔 تم الطلاق\n👤 انفصلتَ عن ", { id: m.spouse, name: m.name }, "\n📌 أصبحتما الآن عازبين من جديد."]));
    }
};
