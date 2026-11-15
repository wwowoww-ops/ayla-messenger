// أوامر التفاعل مع شخص: كلها تمرّ على المستهدف نفسه (منشن/رد/ID) بدالة واحدة
const { pick } = require("../../lib/util");
const make = (name, aliases, emoji, verb, lines) => ({
    name, aliases, level: 0, scope: "group", cooldown: 8,
    description: verb + " شخصًا ما (ترفيه)", usage: name + " @منشن | بالرد",
    async run(ctx) {
        const t = await ctx.target();
        const me = String(ctx.event.senderID);
        if (!t) return ctx.reply("مع من؟ " + name + " @منشن (أو ردّ على رسالته).");
        return ctx.send(ctx.mention([emoji + " ", { id: me, name: await ctx.nameOf(me) }, " " + verb + " ", { id: t.id, name: t.name }, " " + pick(lines)]));
    }
});
module.exports = [
    make("حضن", ["عناق", "hug"], "🤗", "يحتضن", ["حضن دافئ 🌸", "حضنة طويلة 💖", "حضن يشيل الهم"]),
    make("صفع", ["صفعة", "slap"], "👋", "يصفع", ["صفعة خفيفة 😅", "طراااخ!", "على سبيل المزح فقط 🌸"]),
    make("بوسة", ["قبلة", "kiss"], "😘", "يبوس", ["بوسة على الجبين 🌸", "بوسة خجولة 💖"])
];
