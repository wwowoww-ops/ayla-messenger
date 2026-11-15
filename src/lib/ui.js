// زخرفة الرسائل: هيدر لكل رسالة + إطارات القوائم (على نسق Hina بهوية AYLA)
const HEADS = {
    admin: "⌬ ━━ 𝗔𝗬𝗟𝗔 ADMIN ━━ ⌬",
    owner: "⌬ ━━ 𝗔𝗬𝗟𝗔 DEVELOPER ━━ ⌬",
    utility: "⌬ ━━ 𝗔𝗬𝗟𝗔 UTILITY ━━ ⌬",
    fun: "⌬ ━━ 𝗔𝗬𝗟𝗔 FUN ━━ ⌬",
    pic: "⌬ ━━ 𝗔𝗬𝗟𝗔 FUN ━━ ⌬",
    default: "⌬ ━━ 𝗔𝗬𝗟𝗔 ━━ ⌬"
};
const FOOTER = "⌬ ━━━━━━━━━━━━ ⌬";
const TOP = "╭━━━━━━━━━━━━━━━━╮", BOTTOM = "╰━━━━━━━━━━━━━━━━╯";
const head = cat => HEADS[cat] || HEADS.default;
const isDecorated = b => /^\s*(⌬|╭)/.test(b);

// يضيف الهيدر لنص أو لرسالة فيها منشن (ويزحزح مواضع المنشن). لا يغيّر الرسائل المزخرفة أصلًا.
function withHeader(m, cat) {
    const h = head(cat) + "\n\n";
    if (typeof m === "string") return isDecorated(m) ? m : h + m;
    if (!m || typeof m !== "object" || typeof m.body !== "string" || isDecorated(m.body)) return m;
    const out = Object.assign({}, m, { body: h + m.body });
    if (Array.isArray(m.mentions)) out.mentions = m.mentions.map(x => Object.assign({}, x, { fromIndex: (x.fromIndex || 0) + h.length }));
    return out;
}
// رسالة مفصّلة: عنوان + أسطر. lines تُدمج بسطر لكل عنصر؛ العناصر الفارغة تُتجاهل.
const lines = (...l) => l.flat().filter(x => x !== null && x !== undefined && x !== false && x !== "").join("\n");
const box = (title, body) => TOP + "\n𝗔𝗬𝗟𝗔          〢       " + title + "\n" + BOTTOM + "\n" + body;
module.exports = { HEADS, FOOTER, TOP, BOTTOM, head, withHeader, lines, box, isDecorated };
