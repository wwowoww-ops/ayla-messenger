// طلبات ويب لفيسبوك بجلسة البوت نفسها (للميزات التي لا تغطيها المكتبة): fb_dtsg + POST
const UA = "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36";
const cookieOf = api => { const s = api.getAppState(); if (!Array.isArray(s) || !s.length) throw new Error("تعذّر الحصول على جلسة الحساب"); return s.filter(c => c && c.key && c.value !== undefined).map(c => c.key + "=" + c.value).join("; "); };
async function get(url, cookie, ms) {
    const r = await fetch(url, { headers: { Cookie: cookie, "User-Agent": UA, Accept: "text/html,application/xhtml+xml" }, redirect: "follow", signal: AbortSignal.timeout(ms || 20000) });
    return String(await r.text());
}
const dtsgFrom = h => { for (const re of [/"DTSGInitialData",\[\],\{"token":"([^"]+)"/, /"token":"([^"]+)"/, /name="fb_dtsg"\s+value="([^"]+)"/]) { const m = h.match(re); if (m) return m[1]; } return null; };
async function dtsg(cookie) {
    const t = dtsgFrom(await get("https://www.facebook.com/", cookie));
    if (!t) throw new Error("تعذّر استخراج fb_dtsg من الجلسة (قد تكون الجلسة منتهية)");
    return t;
}
async function post(url, form, cookie, ms) {
    const r = await fetch(url, { method: "POST", body: new URLSearchParams(form).toString(), headers: { Cookie: cookie, "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded", Accept: "*/*", Origin: "https://www.facebook.com", Referer: "https://www.facebook.com/" }, redirect: "follow", signal: AbortSignal.timeout(ms || 20000) });
    return String(await r.text());
}
module.exports = { cookieOf, get, dtsg, post, dtsgFrom };
