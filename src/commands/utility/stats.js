// احصائيات: إحصائيات اليوم (بتوقيت تونس): الرسائل النصية، الصور، وأكثر الأعضاء نشاطًا
const H = require("../../lib/history");
const { UHEADER } = require("../../lib/util");
module.exports = {
    name: "احصائيات", aliases: ["stats"], level: 0, scope: "group", cooldown: 30,
    description: "إحصائيات المجموعة اليوم وأكثر الأعضاء نشاطًا", usage: "احصائيات",
    async run(ctx) {
        const tid = String(ctx.event.threadID);
        const info = await ctx.api.getThreadInfo(tid).catch(() => null);
        if (!info) return ctx.reply(UHEADER + "\n❌ تعذر الحصول على معلومات المجموعة.");
        const parts = (info.participantIDs || []).map(String), members = new Set(parts);
        const botId = String(ctx.api.getCurrentUserID());
        const start = H.dayStart();
        await ctx.reply(UHEADER + "\n\n⏳ جاري جلب الإحصائيات...");
        const r = await H.since(ctx.api, tid, start, { amount: 100, maxPages: 100 });
        const act = {}; let text = 0, images = 0;
        for (const m of r.messages) {
            const s = String(m.senderID || m.authorID || ""); if (!s || s === botId || !members.has(s)) continue;
            const ic = H.imageCount(m); images += ic;
            const body = typeof m.body === "string" ? m.body.trim() : "";
            if (ic > 0 || !body) continue;
            act[s] = (act[s] || 0) + 1; text++;
        }
        const top = Object.entries(act).sort((a, b) => b[1] - a[1]).slice(0, 10);
        const medals = ["🥇", "🥈", "🥉"]; let rank = "";
        for (let i = 0; i < top.length; i++) rank += (medals[i] || (i + 1) + ".") + " " + await ctx.nameOf(top[i][0]) + " — " + top[i][1] + " رسالة\n";
        if (!rank) rank = "لا توجد رسائل نصية مسجلة اليوم.";
        const today = new Intl.DateTimeFormat("ar-TN", { timeZone: H.TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
        const note = r.complete ? "" : "\n⚠️ قد تكون الأرقام ناقصة (تعذر جلب كامل السجل: " + r.reason + ")";
        return ctx.reply(UHEADER + "\n📊 إحصائيات المجموعة\n━━━━━━━━━━━━━━━━━━\n🏷️ الاسم:\n" + (info.threadName || info.name || "بدون اسم") + "\n📅 التاريخ:\n" + today + "\n👥 عدد الأعضاء:\n" + parts.length + "\n👑 عدد المشرفين:\n" + (info.adminIDs || []).length +
            "\n━━━━━━━━━━━━━━━━━━\n💬 الرسائل النصية:\n" + text + "\n🖼️ الصور المرسلة:\n" + images + "\n━━━━━━━━━━━━━━━━━━\n🔥 أكثر الأعضاء نشاطًا:\n" + rank + "━━━━━━━━━━━━━━━━━━\n🆔 ID:\n" + tid + note);
    }
};
