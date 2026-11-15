const { pick } = require("../../lib/util");
module.exports = {
    name: "زواج", aliases: ["تزوج", "marry"], level: 0, scope: "group", cooldown: 10,
    description: "زواج ترفيهي مع عضو", usage: "زواج @منشن | بالرد | ID",
    async run(ctx) {
        const me = String(ctx.event.senderID);
        const t = await ctx.target();
        if (!t) return ctx.reply("مع من؟ زواج @منشن (أو ردّ على رسالته).");
        if (t.id === me) return ctx.reply("تتزوج نفسك؟ 😅");
        if (t.id === String(ctx.api.getCurrentUserID())) return ctx.reply("أنا؟ لا يا حلو، خلّني بعيدة 🌸");
        const mine = ctx.store.get("marry:" + me), his = ctx.store.get("marry:" + t.id);
        if (mine) return ctx.reply("أنت متزوج أصلًا! اكتب طلاق أولًا.");
        if (his) return ctx.reply(t.name + " متزوج/ة من شخص آخر.");
        const at = Date.now();
        ctx.store.set("marry:" + me, { spouse: t.id, name: t.name, at });
        ctx.store.set("marry:" + t.id, { spouse: me, name: await ctx.nameOf(me), at });
        return ctx.send(ctx.mention(["💍 مبروك! ", { id: me, name: await ctx.nameOf(me) }, " و ", { id: t.id, name: t.name }, " صارا زوجين. " + pick(["الله يتمم لكم 🌸", "عقبال الأولاد 😄", "بالرفاء والبنين 💖"])]));
    }
};
