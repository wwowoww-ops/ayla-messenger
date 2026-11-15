// حماية الحساب من التقييد: إرسال بإيقاع بشري (طابور + حدود + تأخير عشوائي) وفحص التكرار.
// لا يتجاوز أي حماية من فيسبوك؛ كل ما يفعله أنه يمنع البوت من التصرف كآلة (رشق رسائل، تكرار، أفعال جماعية).
const GLOBAL_PER_MIN = 18;          // أقصى رسائل في الدقيقة لكل الحساب
const THREAD_GAP = [900, 1800];     // أقل فاصل بين رسالتين في نفس المحادثة (مللي ثانية، عشوائي)
const DUP_WINDOW = 15000;           // تجاهل نفس النص في نفس المحادثة خلال هذه المدة
const ACTION_PER_MIN = 6;           // أقصى أفعال إدارية (طرد/ترقية/كنية) في الدقيقة

const FAST = process.env.AYLA_TEST === "1";   // للاختبارات المحلية فقط: بلا انتظار
const rand = ([a, b]) => a + Math.random() * (b - a);
const sleep = ms => new Promise(r => setTimeout(r, FAST ? 0 : ms));

const sentTimes = [];               // أوقات آخر الرسائل (للحد العام)
const threadNext = new Map();       // threadID -> أقرب وقت مسموح
const lastText = new Map();         // threadID -> {t, at}
const actionTimes = [];
const queue = [];
let running = false;

async function pump() {
    if (running) return;
    running = true;
    while (queue.length) {
        const job = queue.shift();
        const now = Date.now();
        while (sentTimes.length && now - sentTimes[0] > 60000) sentTimes.shift();
        let wait = 0;
        if (sentTimes.length >= GLOBAL_PER_MIN) wait = Math.max(wait, 60000 - (now - sentTimes[0]) + 200);
        wait = Math.max(wait, (threadNext.get(job.thread) || 0) - now);
        if (wait > 0 && !FAST) await sleep(wait);
        sentTimes.push(Date.now());
        threadNext.set(job.thread, Date.now() + rand(THREAD_GAP));
        if (threadNext.size > 2000) threadNext.delete(threadNext.keys().next().value);
        try { job.resolve(await job.fn()); } catch (e) { job.resolve(null); }
    }
    running = false;
}

// يضيف عملية إرسال للطابور. typingMs: زمن "الكتابة" قبل الإرسال (يُحسب من طول النص)
function schedule(thread, text, fn, typingMs) {
    const key = String(thread);
    const t = typeof text === "string" ? text : (text && text.body) || "";
    if (t) {
        const l = lastText.get(key);
        if (l && l.t === t && Date.now() - l.at < DUP_WINDOW) return Promise.resolve(null);
        lastText.set(key, { t, at: Date.now() });
        if (lastText.size > 2000) lastText.delete(lastText.keys().next().value);
    }
    return new Promise(resolve => {
        queue.push({ thread: key, resolve, fn: async () => { if (typingMs > 0) await sleep(typingMs); return fn(); } });
        pump();
    });
}

const typingDelay = text => FAST ? 0 : Math.min(3500, 400 + String(text || "").length * 22 + Math.random() * 500);

// حد للأفعال الإدارية: يرجع false إذا تجاوز الحد
function allowAction() {
    const now = Date.now();
    while (actionTimes.length && now - actionTimes[0] > 60000) actionTimes.shift();
    if (actionTimes.length >= ACTION_PER_MIN) return false;
    actionTimes.push(now);
    return true;
}

module.exports = { schedule, typingDelay, allowAction, sleep, FAST };
