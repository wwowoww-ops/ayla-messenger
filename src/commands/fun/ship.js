const { hash } = require("../../lib/util");
module.exports = {
    name: "توافق", aliases: ["ship"], level: 0, scope: "group", cooldown: 8,
    description: "نسبة التوافق بينك وبين شخص (للتسلية)", usage: "توافق @منشن",
    async run(ctx) {
        const t = await ctx.target();
        if (!t) return ctx.reply("مع من؟ توافق @منشن");
        const me = String(ctx.event.senderID);
        const pct = hash([me, t.id].sort().join("-")) % 101;
        return ctx.send(ctx.mention(["💘 التوافق بين ", { id: me, name: await ctx.nameOf(me) }, " و ", { id: t.id, name: t.name }, ": " + pct + "%"]));
    }
};
