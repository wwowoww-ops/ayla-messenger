require("./fonts");
// أدوات الصور: جلب صورة الملف الشخصي (مع بدائل)، قصّها دائرة، تركيب الطبقات، والإرسال كمرفق
const fs = require("fs");
const os = require("os");
const path = require("path");
const sharp = require("sharp");
const cfg = require("../core/config");
const safety = require("./safety");

async function fetchBuf(url, ms) {
    ms = ms || (process.env.AYLA_TEST ? 1200 : 15000);
    const res = await fetch(url, { signal: AbortSignal.timeout(ms), headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 15 * 1024 * 1024) throw new Error("too big");
    return buf;
}
// صورة صالحة: قابلة للقراءة وليست فارغة (بيضاء/رمادية موحّدة، وهي ما يعيده فيسبوك أحيانًا بدل صورة الشخص)
const valid = async b => {
    try {
        const m = await sharp(b).metadata();
        if (!(m.width && m.width >= 30)) return false;
        const st = await sharp(b).removeAlpha().stats();
        return st.channels.some(c => c.stdev > 8);
    } catch (e) { return false; }
};

const esc = s => String(s).replace(/[<>&"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));

// صورة بديلة بحرف الاسم الأول (حين لا نستطيع جلب الصورة الحقيقية)
function placeholder(name, size) {
    const ch = esc(Array.from(String(name || "؟").trim())[0] || "?");
    const hue = [...String(name)].reduce((a, c) => a + c.codePointAt(0), 0) % 360;
    return sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="100%" height="100%" fill="hsl(${hue},55%,55%)"/><text x="50%" y="50%" dy=".35em" text-anchor="middle" font-size="${size * 0.5}" fill="#fff" font-family="DejaVu Sans, Arial, sans-serif">${ch}</text></svg>`)).png().toBuffer();
}

// سلسلة بدائل: رمز Graph ← Graph بلا رمز ← thumbSrc من getUserInfo ← صورة بحرف
const avCache = new Map();
async function avatar(api, uid, name, size) {
    size = size || 512;
    const key = uid + ":" + size;
    if (avCache.has(key)) return avCache.get(key);
    let buf = null;
    const tryUrl = async u => { try { const b = await fetchBuf(u); if (await valid(b)) { buf = b; } } catch (e) { /* التالي */ } };
    // 1) Graph برمز هينا 2) رابط الصورة من جلسة الحساب 3) Graph عام
    if (cfg.avatarToken) await tryUrl("https://graph.facebook.com/" + uid + "/picture?width=" + size + "&height=" + size + "&access_token=" + encodeURIComponent(cfg.avatarToken));
    if (!buf) { try { const info = await api.getUserInfo(uid); const x = info && (info[uid] || info); const u = x && (x.thumbSrc || x.profilePicture); if (u) await tryUrl(u); } catch (e) { /* التالي */ } }
    if (!buf) await tryUrl("https://graph.facebook.com/" + uid + "/picture?width=" + size + "&height=" + size);
    if (!buf) console.error("[صورة] تعذّر جلب صورة الملف الشخصي لـ " + uid + " — سأستعمل حرفًا ملوّنًا");
    if (!buf) buf = await placeholder(name, size);
    avCache.set(key, buf); if (avCache.size > 100) avCache.delete(avCache.keys().next().value);
    return buf;
}

// قصّ دائري، مع حلقة اختيارية
async function circle(buf, size, ring, ringColor) {
    const r = size / 2;
    const base = await sharp(buf).resize(size, size, { fit: "cover" }).composite([{ input: Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${r}" cy="${r}" r="${r}" fill="#fff"/></svg>`), blend: "dest-in" }]).png().toBuffer();
    if (!ring) return base;
    const total = size + ring * 2;
    return sharp(Buffer.from(`<svg width="${total}" height="${total}"><circle cx="${total / 2}" cy="${total / 2}" r="${total / 2}" fill="${ringColor || "#fff"}"/></svg>`)).composite([{ input: base, left: ring, top: ring }]).png().toBuffer();
}

// بطاقة: خلفية SVG + صور دائرية + طبقة SVG علوية. avatars: [{buf, size, x, y, ring, ringColor}] (x,y لمركز الصورة)
async function card(w, h, bg, avatars, over) {
    const layers = [];
    for (const a of avatars || []) {
        const c = await circle(a.buf, a.size, a.ring || 0, a.ringColor);
        const t = a.size + (a.ring || 0) * 2;
        layers.push({ input: c, left: Math.round(a.x - t / 2), top: Math.round(a.y - t / 2) });
    }
    if (over) layers.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${over}</svg>`), left: 0, top: 0 });
    return sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${bg}</svg>`)).composite(layers).png().toBuffer();
}

// إرسال صورة كمرفق: نكتب ملفًا مؤقتًا ثم نمرّره عبر طابور الأمان، ثم نحذفه
async function sendImage(api, buf, body, threadID, replyTo, mentions) {
    const file = path.join(os.tmpdir(), "ayla_" + Date.now() + "_" + Math.floor(Math.random() * 1e6) + ".png");
    fs.writeFileSync(file, buf);
    try {
        return await safety.schedule(threadID, body || "[image]", () => new Promise(resolve => {
            const stream = fs.createReadStream(file); stream.on("error", () => {});
            const msg = { body: body || "", attachment: stream };
            if (mentions && mentions.length) msg.mentions = mentions;
            let done = false; const fin = v => { if (!done) { done = true; resolve(v); } };
            const t = setTimeout(() => fin(null), 30000);
            try {
                const r = api.sendMessage(msg, String(threadID), (e, info) => { clearTimeout(t); fin(e ? null : info); }, replyTo);
                if (r && typeof r.then === "function") r.then(v => { clearTimeout(t); fin(v); }, () => { clearTimeout(t); fin(null); });
            } catch (e) { clearTimeout(t); fin(null); }
        }), safety.typingDelay(body));
    } finally { fs.unlink(file, () => {}); }
}

module.exports = { avatar, circle, card, sendImage, esc, fetchBuf, placeholder };
