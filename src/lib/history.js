// قراءة سجل الرسائل (getThreadHistory) لأوامر الإحصائيات. التوقيت: تونس.
const TZ = "Africa/Tunis";
const ONE_DAY = 86400000;
const ts = m => { const n = Number(m && (m.timestamp || m.time || m.createdAt)); return !Number.isFinite(n) ? 0 : (n > 0 && n < 1e11 ? n * 1000 : n); };
function dayStart(date) { // بداية يوم تونس (UTC+1 ثابتة، كما في الأصل)
    const p = {}; for (const x of new Intl.DateTimeFormat("en-US", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date || new Date())) if (x.type !== "literal") p[x.type] = x.value;
    return Date.UTC(+p.year, +p.month - 1, +p.day) - 3600000;
}
const dayName = t => new Intl.DateTimeFormat("ar-TN", { timeZone: TZ, weekday: "long" }).format(new Date(t));
const dateText = t => new Intl.DateTimeFormat("ar-TN", { timeZone: TZ, day: "2-digit", month: "2-digit" }).format(new Date(t));
const isImage = a => {
    if (!a) return false;
    const ty = String(a.type || a.mimeType || a.mime || "").toLowerCase();
    if (["photo", "image", "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"].includes(ty)) return true;
    if (a.photoID || a.photoId || a.imageID || a.imageId) return true;
    return /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(String(a.url || a.href || a.src || a.previewUrl || a.previewURL || ""));
};
const imageCount = m => (m && Array.isArray(m.attachments) ? m.attachments.filter(isImage).length : 0);
const key = m => { const id = m.messageID || m.messageId || m.id; return id ? "id:" + id : ["f", ts(m), m.senderID, m.body || ""].join("|"); };
const sleep = ms => new Promise(r => setTimeout(r, process.env.AYLA_TEST ? 1 : ms));

async function page(api, threadID, before, amount) {
    let err;
    for (let i = 1; i <= 3; i++) {
        try { const h = await api.getThreadHistory(String(threadID), amount, before); return Array.isArray(h) ? h : []; }
        catch (e) { err = e; if (i < 3) await sleep(1000 * i); }
    }
    throw err || new Error("فشل تحميل السجل");
}
// يجمع الرسائل من "since" حتى الآن. يعيد {messages, complete, pages, reason}
async function since(api, threadID, sinceTs, opts) {
    const amount = (opts && opts.amount) || 50, maxPages = (opts && opts.maxPages) || 200;
    const seen = new Set(), messages = []; let before, oldest = null, pages = 0, complete = false, reason = "max_pages";
    for (let i = 0; i < maxPages; i++) {
        pages++;
        let h; try { h = await page(api, threadID, before, amount); } catch (e) { reason = "history_error"; break; }
        const valid = h.filter(m => ts(m) > 0).sort((a, b) => ts(a) - ts(b));
        if (!valid.length) { if (oldest !== null && oldest < sinceTs) { complete = true; reason = "reached_start"; } else reason = "empty_history"; break; }
        const pOld = ts(valid[0]); if (oldest === null || pOld < oldest) oldest = pOld;
        for (const m of valid) { if (ts(m) < sinceTs) continue; const k = key(m); if (!seen.has(k)) { seen.add(k); messages.push(m); } }
        if (pOld < sinceTs) { complete = true; reason = "reached_start"; break; }
        if (before !== undefined && pOld >= before) { reason = "pagination_stuck"; break; }
        before = pOld;
        await sleep(350); // لطيف مع فيسبوك: لا نطلب الصفحات بلا فواصل
    }
    messages.sort((a, b) => ts(a) - ts(b));
    return { messages, complete, pages, reason };
}
module.exports = { ts, dayStart, dayName, dateText, imageCount, since, ONE_DAY, TZ };
