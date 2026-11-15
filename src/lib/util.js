// أدوات مشتركة: توحيد النص العربي، الإرسال الآمن، المنشن، مسافة التعديل
const norm = s => String(s || "").toLowerCase()
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[إأآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه")
    .replace(/[_\s]+/g, "_").trim();

function lev(a, b) {
    const m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, i) => i);
    for (let i = 1; i <= m; i++) {
        const cur = [i];
        for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = cur;
    }
    return prev[n];
}

// api.sendMessage بنمط الوعد مع مهلة، ويمرّ عبر طابور الأمان (إيقاع بشري وحدود)
const safety = require("./safety");
function rawSend(api, message, threadID, replyTo) {
    return new Promise(resolve => {
        let done = false;
        const fin = v => { if (!done) { done = true; resolve(v); } };
        const t = setTimeout(() => fin(null), 20000);
        try {
            const r = api.sendMessage(message, String(threadID), (err, info) => { clearTimeout(t); fin(err ? null : info); }, replyTo);
            if (r && typeof r.then === "function") r.then(v => { clearTimeout(t); fin(v); }, () => { clearTimeout(t); fin(null); });
        } catch (e) { clearTimeout(t); console.error("[send]", e.message); fin(null); }
    });
}
function send(api, message, threadID, replyTo) {
    const body = typeof message === "string" ? message : (message && message.body) || "";
    return safety.schedule(threadID, message, () => rawSend(api, message, threadID, replyTo), safety.typingDelay(body));
}

// يبني رسالة فيها منشن: parts = ["نص", {id,name}, "نص"]
function withMentions(parts, extra) {
    let body = "";
    const mentions = [];
    for (const p of parts) {
        if (p && typeof p === "object" && p.id) {
            const tag = "@" + (p.name || "عضو");
            mentions.push({ id: String(p.id), tag, fromIndex: body.length });
            body += tag;
        } else body += String(p == null ? "" : p);
    }
    return Object.assign({ body, mentions }, extra || {});
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
const pick = a => a[Math.floor(Math.random() * a.length)];
const hash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; };

const HEADER = "⌬ ━━ 𝗔𝗬𝗟𝗔 ━━ ⌬";
const UHEADER = "⌬ ━━ 𝗔𝗬𝗟𝗔 • الأدوات ━━ ⌬";

module.exports = {
    HEADER, UHEADER, norm, lev, send, withMentions, sleep, pick, hash };
