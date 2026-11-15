// الرد على قائمة "اوامر" برقم الفئة أو اسمها (أو "رجوع"). لكل رسالة قائمة صاحبها فقط.
const menu = require("../lib/menu");
const ui = require("../lib/ui");
const { send } = require("../lib/util");
const { norm } = require("../lib/util");
const menus = new Map(); // messageID -> {author, at}
const remember = (id, author) => { menus.set(String(id), { author: String(author), at: Date.now() }); if (menus.size > 500) menus.delete(menus.keys().next().value); };

module.exports = {
    name: "help-menu", order: 5, remember,
    async onMessage(ctx) {
        const e = ctx.event, rep = e.messageReply;
        if (!rep || !rep.messageID) return false;
        const m = menus.get(String(rep.messageID));
        if (!m || Date.now() - m.at > 30 * 60 * 1000) return false;
        const body = String(e.body || "").trim();
        if (!body) return false;
        const reply = t => send(ctx.api, ui.withHeader(t, "utility"), e.threadID, e.messageID);
        if (String(e.senderID) !== m.author) { await reply("⚠️ هذه ليست قائمتك\n↳ اكتب " + ctx.prefix + "اوامر لفتح قائمة خاصة بك"); return true; }
        const q = norm(menu.digits(body));
        let out;
        if (/^(رجوع|back|0)$/.test(q)) out = menu.mainMenu();
        else {
            const cat = menu.find(body);
            if (!cat) out = ui.TOP + "\n𝗔𝗬𝗟𝗔          〢       تنبيه\n" + ui.BOTTOM + "\n⚠️ الاختيار غير صحيح\n↳ رد برقم الفئة من ❶ إلى ❺\n↳ أو اكتب اسم الفئة\n" + ui.TOP + "\nحاول مرة أخرى\n" + ui.BOTTOM;
            else out = menu.categoryMenu(cat, menu.namesOf(ctx.loader, cat.id));
        }
        const info = await reply(out);
        const id = info && (info.messageID || info.messageId);
        if (id) remember(id, m.author);
        return true;
    }
};
