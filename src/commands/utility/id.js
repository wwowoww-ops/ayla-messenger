module.exports = {
    name: "ايدي", aliases: ["id"], level: 0, cooldown: 3,
    description: "معرّف فيسبوك (UID) لك أو لمن تذكره", usage: "ايدي | ايدي @منشن | بالرد",
    async run(ctx) {
        const t = await ctx.target();
        const id = t ? t.id : String(ctx.event.senderID);
        const name = t ? t.name : await ctx.nameOf(id);
        return ctx.reply(name + "\n" + id);
    }
};
