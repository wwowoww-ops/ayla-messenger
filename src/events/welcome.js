// ترحيب بالأعضاء الجدد وتحية عند إضافة البوت لمجموعة. يُعطَّل بالأمر: ترحيب ايقاف
module.exports = {
    name: "welcome", types: ["log:subscribe"],
    async onEvent(ctx, event) {
        const { api, store } = ctx;
        const threadID = String(event.threadID);
        if (store.get("welcome:off:" + threadID)) return;
        const added = (event.logMessageData && event.logMessageData.addedParticipants) || [];
        if (!added.length) return;
        const me = String(api.getCurrentUserID());
        if (added.some(p => String(p.userFbId) === me)) return ctx.send("أهلًا بالجميع 🌸 أنا آيلا. اكتبوا «اوامر» لتشوفوا ما أقدر عليه، أو ناديوني وأتكلم معكم.");
        const parts = ["🌸 أهلًا ", ...added.flatMap((p, i) => (i ? [" و "] : []).concat([{ id: String(p.userFbId), name: (p.fullName || "عضو").split(" ")[0] }])), " نورتم المجموعة!"];
        return ctx.send(ctx.mention(parts));
    }
};
