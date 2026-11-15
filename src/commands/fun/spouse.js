module.exports = {
    name: "زوجي", aliases: ["زوجتي", "spouse"], level: 0, cooldown: 5,
    description: "عرض زوجك/زوجتك وتاريخ الزواج", usage: "زوجي",
    async run(ctx) {
        const m = ctx.store.get("marry:" + ctx.event.senderID);
        if (!m) return ctx.reply("ℹ️ أنت غير متزوج\n↳ جرّب: " + ctx.prefix + "زواج @منشن أو " + ctx.prefix + "زوجيني");
        const days = Math.max(0, Math.floor((Date.now() - m.at) / 86400000));
        return ctx.send(ctx.mention(["💞 معلومات الزواج\n👰 شريك حياتك: ", { id: m.spouse, name: m.name }, "\n📅 منذ: " + days + " يوم\n🆔 " + m.spouse]));
    }
};
