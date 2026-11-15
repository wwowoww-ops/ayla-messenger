// قائمة الأوامر تُبنى تلقائيًا من الأوامر المحمّلة، وتعرض لكل شخص ما يحق له فقط
const CAT = { admin: "🛡️ الإدارة", owner: "👑 المطوّر", utility: "🧰 عامة", fun: "🎭 تسلية" };
module.exports = {
    name: "اوامر", aliases: ["مساعدة", "help"], level: 0, cooldown: 5,
    description: "قائمة الأوامر", usage: "اوامر | اوامر اسم_الأمر",
    async run(ctx) {
        const lv = await ctx.perms.levelOf(ctx.api, ctx.event);
        const p = ctx.prefix || "";
        const q = ctx.args[0];
        if (q) {
            const c = ctx.loader.commands.get(require("../../lib/util").norm(q));
            if (!c || c.level > lv) return ctx.reply("ما لقيت هذا الأمر.");
            return ctx.reply(p + c.name + "\n" + c.description + "\nالاستعمال: " + p + (c.usage || c.name) + (c.aliases.length ? "\nأسماء بديلة: " + c.aliases.join("، ") : ""));
        }
        const by = {};
        for (const c of ctx.loader.list) if (c.level <= lv) (by[c.category] = by[c.category] || []).push(c.name);
        let out = "🌸 أوامر آيلا (البادئة: «" + (p || "بدون") + "»)\n";
        for (const k of Object.keys(by)) out += "\n" + (CAT[k] || k) + "\n" + by[k].join(" • ") + "\n";
        out += "\nوتقدر تكلمني مباشرة: ناديني «آيلا» أو ردّ على رسالتي، وفي الخاص أرد على كل شيء.";
        return ctx.reply(out);
    }
};
