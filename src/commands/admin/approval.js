// موافقة: عرض حالة «موافقة الأدمن على الأعضاء الجدد» والطلبات المعلّقة (التغيير يدويًا من إعدادات المجموعة)
const isOn = i => !!i && (i.approvalMode === true || i.approvalMode === 1 || i.approvalMode === "1");
const info = async (api, tid) => api.getThreadInfo(String(tid));
module.exports = {
    name: "موافقة", aliases: ["approval"], level: 1, scope: "group", cooldown: 8,
    description: "عرض حالة موافقة الأدمن على الأعضاء الجدد والطلبات المعلّقة (التغيير يدويًا)", usage: "موافقة | موافقة تشغيل | موافقة ايقاف",
    async run(ctx) {
        const tid = String(ctx.event.threadID), p = ctx.prefix, a = String(ctx.args[0] || "").toLowerCase();
        let i; try { i = await info(ctx.api, tid); } catch (e) { return ctx.reply("❌ تعذّر جلب معلومات المجموعة الآن\n↳ حاول بعد قليل."); }
        const on = isOn(i), pending = Array.isArray(i && i.approvalQueue) ? i.approvalQueue.length : 0;
        if (!a) return ctx.reply("🛡️ موافقة الأدمن على الأعضاء الجدد\n━━━━━━━━━━━━━━━━━━\n📌 الحالة: " + (on ? "مفعّلة ✅" : "متوقفة ❌") + "\n📥 الطلبات المعلّقة: " + pending + "\n━━━━━━━━━━━━━━━━━━" + (on && pending ? "\n↳ " + p + "قبول ← لقبول الطلبات" : ""));
        const want = /^(تشغيل|تفعيل|on|enable)$/.test(a) ? true : /^(ايقاف|إيقاف|تعطيل|off|disable)$/.test(a) ? false : null;
        if (want === null) return ctx.reply("❌ خيار غير معروف\n↳ " + p + "موافقة تشغيل\n↳ " + p + "موافقة ايقاف");
        if (want === on) return ctx.reply("ℹ️ الموافقة " + (on ? "مفعّلة" : "متوقفة") + " بالفعل في هذه المجموعة.");
        // فيسبوك يرفض هذا الطلب من جلسة البوت (يرجع صفحة خطأ)، ولا توجد دالة في المكتبة لتغييره. لا نكرّر طلبًا مرفوضًا حتى لا نثير الشك في الحساب.
        return ctx.reply("ℹ️ لا أستطيع تغيير هذا الإعداد بنفسي\n━━━━━━━━━━━━━━━━━━\n📌 الحالة الحالية: " + (on ? "مفعّلة ✅" : "متوقفة ❌") + "\n━━━━━━━━━━━━━━━━━━\n🔧 غيّرها يدويًا:\n↳ افتح المجموعة ← اسمها ← «Members / الأعضاء»\n↳ ثم «Admin approval / الموافقة على الأعضاء»\n━━━━━━━━━━━━━━━━━━\n↳ بعد التفعيل: " + p + "قبول لقبول الطلبات من هنا");
    }
};
