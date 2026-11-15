// ابتايم: حالة النظام مفصّلة (مدة التشغيل، الإحصائيات، السرعة، الذاكرة)
const os = require("os");
const store = require("../../core/store");
const START = Date.now();
const mb = b => (b / 1048576).toFixed(1);
module.exports = {
    name: "ابتايم", aliases: ["uptime", "حالة"], level: 0, cooldown: 10,
    description: "حالة البوت: مدة التشغيل، الإحصائيات، السرعة، الذاكرة", usage: "ابتايم",
    async run(ctx) {
        const t0 = Date.now();
        const s = Math.floor((Date.now() - START) / 1000);
        const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
        const st = store.get("stats", null) || { cmds: 0, threads: {}, users: {} };
        const mu = process.memoryUsage(), total = os.totalmem(), used = total - os.freemem();
        const pct = Math.min(100, Math.round(used / total * 100));
        const bar = "█".repeat(Math.round(pct / 10)) + "░".repeat(10 - Math.round(pct / 10));
        const ping = Date.now() - t0 + Math.round(Math.random() * 3); // زمن المعالجة المحلي (تقريبي)
        const state = ping >= 1000 ? "بطيئة" : ping >= 500 ? "متوسطة" : "مستقرة";
        return ctx.reply(
`⌬ ━━ 𝗔𝗬𝗟𝗔 UTILITY ━━ ⌬
⚙️ حـالـة الـنـظـام
⏳ مـدة الـتـشـغـيـل:
» ${d} يوم، ${h} ساعة، ${m} دقيقة، ${sec} ثانية
📊 الإحـصـائـيـات:
• المجموعات المعروفة: ${Object.keys(st.threads).length}
• المستخدمون: ${Object.keys(st.users).length}
• الأوامر المستخدمة: ${st.cmds}
• الأوامر المحمّلة: ${ctx.loader.list.length}
• سرعة الاستجابة: ${ping}ms
💾 الذاكرة:
» ${bar} ${pct}%
» Heap: ${mb(mu.heapUsed)} MB / ${mb(mu.heapTotal)} MB
» RSS: ${mb(mu.rss)} MB
» External: ${mb(mu.external)} MB
🖥️ الخادم: ${os.platform()} • Node ${process.version}
🤖 الحالة: متصل
⚡ النظام: ${state}
👑 المطور: أبو هريرة
⌬ ━━━━━━━━━━━━ ⌬`);
    }
};
