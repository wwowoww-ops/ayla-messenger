// خروج عضو: منع الخروج (يعيد من خرج بنفسه، مفعّل افتراضيًا) ثم التوديع (يميّز الخروج من الطرد)
const { isOn } = require("../lib/toggle");
const safety = require("../lib/safety");
const L = "━━━━━━━━━━━━━━━━━━";
module.exports = {
    name: "leave", types: ["log:unsubscribe"],
    async onEvent(ctx, event) {
        const { api, store } = ctx;
        const threadID = String(event.threadID);
        const left = String((event.logMessageData && event.logMessageData.leftParticipantFbId) || "");
        const me = String(api.getCurrentUserID());
        if (!left || left === me) return;
        const voluntary = String(event.author || "") === left;
        const name = (await ctx.nameOf(left)).split(" ")[0];
        const p = ctx.prefix || "";

        if (voluntary && isOn(store, "antiout", threadID, true)) {
            if (!safety.allowAction()) console.error("[منع الخروج] تجاوزتُ حد الأفعال المؤقت، لم أُعد " + left);
            else {
                let err = await new Promise(res => api.addUserToGroup(left, threadID, e => res(e || null)));
                if (!err) { // فيسبوك قد لا يُرجع خطأ وهو لم يضف العضو فعلًا: نتحقق من وجوده بعد قليل ولا نصدّق الرد
                    await new Promise(r => setTimeout(r, process.env.AYLA_TEST ? 0 : 3000));
                    const ti = await api.getThreadInfo(threadID).catch(() => null);
                    const inside = ti && Array.isArray(ti.participantIDs) && ti.participantIDs.map(String).includes(left);
                    if (ti && !inside) err = new Error("لم يظهر العضو في المجموعة بعد الإضافة");
                }
                if (!err) return ctx.send(ctx.mention(["🌸 ما في خروج بهالسهولة!\n" + L + "\n👤 ", { id: left, name }, "\n🔁 تمت إعادته إلى المجموعة\n📌 لإيقاف هذه الميزة اكتب: " + p + "منع_الخروج\n" + L + "\n😄 البيت بيتك، تعال وقت ما تشاء"]));
                console.error("[منع الخروج] فشلت إعادة " + left + ":", err && (err.message || err.error || err));
                await ctx.send("⚠️ حاولت إعادة " + name + " لكن لم أنجح\n" + L + "\n↳ غالبًا أنه حظر البوت، أو إعداداته تمنع الإضافة، أو المجموعة تتطلب موافقة الأدمن.");
            }
        }
        if (!isOn(store, "farewell", threadID, true)) return;
        const info = await api.getThreadInfo(threadID).catch(() => null);
        const count = info && Array.isArray(info.participantIDs) ? info.participantIDs.length : 0;
        const tail = count ? "\n👥 عدد الأعضاء الآن: " + count : "";
        if (voluntary) return ctx.send("👋 وداعًا يا " + name + "\n" + L + "\n🚪 غادر المجموعة بنفسه" + tail + "\n" + L + "\n🌸 نتمنى له التوفيق أينما ذهب، وأبوابنا مفتوحة له دائمًا.");
        return ctx.send("🚪 تم إخراج " + name + " من المجموعة\n" + L + "\n🛡️ بقرار من الإدارة" + tail + "\n" + L + "\n📌 نرجو من الجميع الالتزام بقوانين المجموعة.");
    }
};
