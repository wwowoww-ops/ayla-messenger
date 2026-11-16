// اوامر: قائمة تفاعلية بصورة. "اوامر" تفتح القائمة، وترد عليها برقم الفئة. "اوامر اسم_الأمر" تعرض تفاصيل أمر.
const img = require("../../lib/img");
const menu = require("../../lib/menu");
const ui = require("../../lib/ui");
const { norm } = require("../../lib/util");
module.exports = {
    name: "اوامر", aliases: ["مساعدة", "help", "قائمة"], level: 0, cooldown: 5,
    description: "قائمة الأوامر التفاعلية بالصورة", usage: "اوامر | اوامر اسم_الأمر",
    async run(ctx) {
        const q = ctx.args.join(" ").trim();
        if (q) {
            const c = ctx.loader.commands.get(norm(q.replace(/^[^\p{L}\p{N}]+/u, "")));
            if (!c) return ctx.reply("❌ ما لقيت أمرًا بهذا الاسم: «" + q + "»\n↳ اكتب " + ctx.prefix + "اوامر لعرض القائمة كاملة.");
            const lvl = ["الجميع", "أدمن المجموعة", "المطوّر فقط"][c.level];
            return ctx.reply(ui.lines("📖 تفاصيل الأمر", "━━━━━━━━━━━━━━━━━━", "🔹 الاسم: " + c.name, "📝 الوصف: " + (c.description || "—"),
                "⌨️ الاستعمال: " + ctx.prefix + (c.usage || c.name), c.aliases.length ? "🔁 أسماء بديلة: " + c.aliases.join("، ") : "",
                "🔐 الصلاحية: " + lvl, "⏱️ الانتظار بين الاستعمالين: " + c.cooldown + " ثانية", "━━━━━━━━━━━━━━━━━━", "💡 جرّبه: " + ctx.prefix + (c.usage || c.name)));
        }
        const body = menu.mainMenu() + "\n\n📌 البادئة: «" + (ctx.prefix || "بدون") + "»\n💬 وتقدر تكلمني مباشرة: ناديني «آيلا» أو ردّ على رسالتي.";
        const text = ui.head("utility") + "\n\n" + body;
        const pic = await require("../../lib/banner")().catch(() => null);
        const info = pic ? await img.sendImage(ctx.api, pic, text, ctx.event.threadID, ctx.event.messageID) : await ctx.reply(text);
        const id = info && (info.messageID || info.messageId);
        if (id) require("../../events/help-menu").remember(id, ctx.event.senderID);
        return info;
    }
};
