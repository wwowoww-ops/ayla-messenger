// موافقة: عرض حالة «موافقة الأدمن على الأعضاء الجدد» وتفعيلها أو إيقافها (يحتاج أن يكون البوت أدمن)
const web = require("../../lib/fbweb");
const safety = require("../../lib/safety");
const isOn = i => !!i && (i.approvalMode === true || i.approvalMode === 1 || i.approvalMode === "1");
const info = async (api, tid) => api.getThreadInfo(String(tid));
module.exports = {
    name: "موافقة", aliases: ["approval"], level: 1, scope: "group", cooldown: 8,
    description: "عرض حالة موافقة الأدمن على الأعضاء الجدد وتفعيلها أو إيقافها", usage: "موافقة | موافقة تشغيل | موافقة ايقاف",
    async run(ctx) {
        const tid = String(ctx.event.threadID), p = ctx.prefix, a = String(ctx.args[0] || "").toLowerCase();
        let i; try { i = await info(ctx.api, tid); } catch (e) { return ctx.reply("❌ تعذّر جلب معلومات المجموعة الآن\n↳ حاول بعد قليل."); }
        const on = isOn(i), pending = Array.isArray(i && i.approvalQueue) ? i.approvalQueue.length : 0;
        if (!a) return ctx.reply("🛡️ موافقة الأدمن على الأعضاء الجدد\n━━━━━━━━━━━━━━━━━━\n📌 الحالة: " + (on ? "مفعّلة ✅" : "متوقفة ❌") + "\n📥 الطلبات المعلّقة: " + pending + "\n━━━━━━━━━━━━━━━━━━\n↳ " + p + "موافقة تشغيل\n↳ " + p + "موافقة ايقاف" + (on && pending ? "\n↳ " + p + "قبول ← لقبول الطلبات" : ""));
        const want = /^(تشغيل|تفعيل|on|enable)$/.test(a) ? true : /^(ايقاف|إيقاف|تعطيل|off|disable)$/.test(a) ? false : null;
        if (want === null) return ctx.reply("❌ خيار غير معروف\n↳ " + p + "موافقة تشغيل\n↳ " + p + "موافقة ايقاف");
        if (want === on) return ctx.reply("ℹ️ الموافقة " + (on ? "مفعّلة" : "متوقفة") + " بالفعل في هذه المجموعة.");
        if (!(await ctx.perms.botIsAdmin(ctx.api, tid))) return ctx.reply("⚠️ لا أملك صلاحية الأدمن في هذه المجموعة\n↳ اجعلني أدمن حتى أستطيع تغيير هذا الإعداد.");
        if (!safety.allowAction()) return ctx.reply("⏳ نفّذتُ أفعالًا إدارية كثيرة مؤخرًا\n↳ أنتظر دقيقة لحماية الحساب، ثم أعد المحاولة.");
        try {
            const res = String(await web.apiPost(ctx.api, "https://www.facebook.com/messaging/set_approval_mode/?dpr=1", { set_mode: want ? "1" : "0", thread_fbid: tid }) || "");
            console.error("[موافقة] رد فيسبوك:", res.slice(0, 400).replace(/\s+/g, " "));
            let after = null; // لا نصدّق الرد، نتحقق من الحالة الفعلية (مع مهلة لأن فيسبوك قد يتأخر)
            for (let k = 0; k < 3 && after !== want; k++) { await new Promise(r => setTimeout(r, process.env.AYLA_TEST ? 0 : 2500)); after = isOn(await info(ctx.api, tid)); }
            if (after !== want) {
                const err = /"error(Summary|Description)?"\s*:\s*"([^"]{3,120})/.exec(res);
                throw new Error("فيسبوك لم يغيّر الحالة" + (err ? " (" + err[2] + ")" : /for \(;;\);/.test(res) ? "" : res ? " — الرد ليس بصيغة الواجهة المتوقعة" : " — رد فارغ"));
            }
            return ctx.reply(want ? "✅ تم تفعيل موافقة الأدمن\n↳ أي عضو جديد سيدخل قائمة الطلبات أولًا.\n↳ استعمل " + p + "قبول لقبول الطلبات." : "✅ تم إيقاف موافقة الأدمن\n↳ يستطيع الأعضاء الجدد الانضمام مباشرة.");
        } catch (e) {
            console.error("[موافقة]", e && e.message);
            return ctx.reply("❌ فشل تغيير موافقة الأدمن\n↳ " + ((e && e.message) || "خطأ غير معروف") + "\n↳ تأكد أنني أدمن وأن الجلسة سليمة، أو غيّر الإعداد يدويًا من إعدادات المجموعة.");
        }
    }
};
