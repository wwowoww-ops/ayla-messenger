// ترحيب بالأعضاء الجدد وتحية عند إضافة البوت لمجموعة. يُعطَّل بالأمر: ترحيب ايقاف
const { isOn } = require("../lib/toggle");
module.exports = {
    name: "welcome", types: ["log:subscribe"],
    async onEvent(ctx, event) {
        const { api, store } = ctx;
        const threadID = String(event.threadID);
        if (!isOn(store, "welcome", threadID, true)) return;
        const added = (event.logMessageData && event.logMessageData.addedParticipants) || [];
        if (!added.length) return;
        const me = String(api.getCurrentUserID());
        if (added.some(p => String(p.userFbId) === me)) return ctx.send("🌸 أهلًا بالجميع، أنا آيلا\n━━━━━━━━━━━━━━━━━━\n↳ اكتبوا «" + (ctx.prefix || "") + "اوامر» لتشوفوا قائمة الأوامر\n↳ أو ناديوني باسمي وأتكلم معكم\n↳ وفي الخاص أرد على كل شيء");
        const parts = ["🌸 أهلًا ", ...added.flatMap((p, i) => (i ? [" و "] : []).concat([{ id: String(p.userFbId), name: (p.fullName || "عضو").split(" ")[0] }])), " نورتم المجموعة!"];
        return ctx.send(ctx.mention(parts));
    }
};
