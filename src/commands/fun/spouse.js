module.exports = {
    name: "زوجي", aliases: ["زوجتي", "spouse"], level: 0, cooldown: 5,
    description: "عرض زوجك/زوجتك وتاريخ الزواج", usage: "زوجي",
    async run(ctx) {
        const m = ctx.store.get("marry:" + ctx.event.senderID);
        if (!m) return ctx.reply("أنت غير متزوج. جرّب: زواج @منشن");
        const days = Math.max(0, Math.floor((Date.now() - m.at) / 86400000));
        return ctx.send(ctx.mention(["💞 متزوج من ", { id: m.spouse, name: m.name }, " منذ " + days + " يوم."]));
    }
};
