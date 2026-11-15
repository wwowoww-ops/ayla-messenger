module.exports = {
    name: "طلاق", aliases: ["divorce"], level: 0, cooldown: 10,
    description: "إنهاء زواجك الحالي", usage: "طلاق",
    async run(ctx) {
        const me = String(ctx.event.senderID), m = ctx.store.get("marry:" + me);
        if (!m) return ctx.reply("أنت غير متزوج.");
        ctx.store.del("marry:" + me); ctx.store.del("marry:" + m.spouse);
        return ctx.reply("💔 تم الطلاق من " + m.name + ".");
    }
};
