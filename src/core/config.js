// يدمج config.js مع متغيرات البيئة ويتجاهل القيم النائبة
let raw = require("../../config");
// config.local.js (غير مرفوع إلى GitHub) يتجاوز القيم: ضع فيه المفاتيح والمعرّفات الحقيقية
try { raw = Object.assign({}, raw, require("../../config.local")); } catch (e) { /* اختياري */ }
const clean = v => (typeof v === "string" && /ضع_/.test(v) ? "" : v);
const cfg = {
    botName: raw.botName || "آيلا",
    prefix: raw.prefix === undefined ? "." : raw.prefix,
    owners: (process.env.OWNERS ? process.env.OWNERS.split(",") : raw.owners || []).map(String).map(s => s.trim()).filter(s => s && !/ضع_/.test(s)),
    aiKey: clean(process.env.AYLA_AI_KEY || raw.aiKey) || "",
    aiUrl: process.env.AYLA_AI_URL || raw.aiUrl,
    aiModel: raw.aiModel || "claude",
    aiNPredict: raw.aiNPredict || 180,
    databaseUrl: clean(process.env.DATABASE_URL || raw.databaseUrl) || "",
    // اختياري: رمز لجلب صور الملفات الشخصية بجودة عالية (FB_AVATAR_TOKEN). بدونه نستعمل بدائل.
    avatarToken: clean(process.env.FB_AVATAR_TOKEN || raw.avatarToken) || "",
    appStatePath: raw.appStatePath || "appstate.json"
};
module.exports = cfg;
