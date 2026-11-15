// ايام: إحصائيات آخر 7 أيام (رسائل، صور، أعضاء نشطون لكل يوم) بتوقيت تونس
const H = require("../../lib/history");
const { UHEADER } = require("../../lib/util");
module.exports = {
    name: "ايام", aliases: ["days"], level: 0, scope: "group", cooldown: 60,
    description: "إحصائيات المجموعة خلال آخر 7 أيام", usage: "ايام",
    async run(ctx) {
        const tid = String(ctx.event.threadID);
        const info = await ctx.api.getThreadInfo(tid).catch(() => null);
        if (!info) return ctx.reply(UHEADER + "\n\n❌ فشل جلب معلومات المجموعة.");
        const members = new Set((info.participantIDs || []).map(String)), botId = String(ctx.api.getCurrentUserID());
        const today = H.dayStart(), weekStart = today - 6 * H.ONE_DAY;
        await ctx.reply(UHEADER + "\n\n⏳ جاري جلب الإحصائيات... (قد يستغرق دقيقة)");
        const r = await H.since(ctx.api, tid, weekStart, { amount: 50, maxPages: 400 });
        const days = [...Array(7)].map((_, i) => ({ start: weekStart + i * H.ONE_DAY, messages: 0, images: 0, users: new Set(), failed: false }));
        // الأيام التي لم نصل إليها (قبل أقدم رسالة قرأناها) تُعلَّم "فشل جلب" إن لم يكتمل السجل
        const oldest = r.messages.length ? H.ts(r.messages[0]) : null;
        if (!r.complete) for (const d of days) if (oldest === null || d.start + H.ONE_DAY <= oldest) d.failed = true;
        for (const m of r.messages) {
            const s = String(m.senderID || m.authorID || ""); if (!s || s === botId) continue;
            const d = days[Math.floor((H.ts(m) - weekStart) / H.ONE_DAY)]; if (!d || d.failed) continue;
            const ic = H.imageCount(m); d.images += ic;
            const body = typeof m.body === "string" ? m.body.trim() : "";
            if (ic === 0 && body) d.messages++;
            if (members.has(s)) d.users.add(s);
        }
        let totalM = 0, totalI = 0, best = null, txt = "";
        for (const d of days) {
            const lab = "📅 " + H.dayName(d.start) + " " + H.dateText(d.start) + "\n";
            if (d.failed) { txt += lab + "❌ فشل جلب إحصائيات هذا اليوم\n\n"; continue; }
            totalM += d.messages; totalI += d.images;
            if (!best || d.messages + d.images > best.messages + best.images) best = d;
            txt += lab + "💬 " + d.messages + " رسالة\n🖼️ " + d.images + " صورة\n👥 " + d.users.size + " أعضاء نشطين\n\n";
        }
        const active = best && best.messages + best.images > 0 ? H.dayName(best.start) + " " + H.dateText(best.start) + "\n💬 " + best.messages + " رسالة\n🖼️ " + best.images + " صورة" : "لا يوجد";
        const status = r.complete ? "✅ تم جلب كامل فترة الـ7 أيام\n📚 الصفحات المقروءة: " + r.pages : "⚠️ تعذر جلب كامل فترة الـ7 أيام\n📚 الصفحات المقروءة: " + r.pages + "\n🔎 السبب: " + r.reason;
        return ctx.reply(UHEADER + "\n📅 إحصائيات آخر 7 أيام\n━━━━━━━━━━━━━━━━━━\n🏷️ الاسم:\n" + (info.threadName || info.name || "بدون اسم") + "\n👥 عدد الأعضاء:\n" + members.size +
            "\n━━━━━━━━━━━━━━━━━━\n" + txt + "━━━━━━━━━━━━━━━━━━\n💬 الرسائل النصية:\n" + totalM + "\n🖼️ الصور المرسلة:\n" + totalI + "\n━━━━━━━━━━━━━━━━━━\n🔥 أنشط يوم:\n" + active + "\n━━━━━━━━━━━━━━━━━━\n" + status + "\n━━━━━━━━━━━━━━━━━━\n🆔 ID:\n" + tid);
    }
};
