// خروج عضو: توديع (يميّز الخروج من الطرد) + منع الخروج (يعيد من خرج بنفسه) إن فُعِّل
const { isOn } = require("../lib/toggle");
const safety = require("../lib/safety");
module.exports = {
    name: "leave", types: ["log:unsubscribe"],
    async onEvent(ctx, event) {
        const { api, store, perms } = ctx;
        const threadID = String(event.threadID);
        const left = String((event.logMessageData && event.logMessageData.leftParticipantFbId) || "");
        const me = String(api.getCurrentUserID());
        if (!left || left === me) return;
        const voluntary = String(event.author || "") === left;
        const name = (await ctx.nameOf(left)).split(" ")[0];

        if (voluntary && isOn(store, "antiout", threadID, false) && !perms.isOwner(left) && safety.allowAction()) {
            const ok = await new Promise(res => api.addUserToGroup(left, threadID, e => res(!e)));
            if (ok) return ctx.send(ctx.mention(["🌸 رجّعنا ", { id: left, name }, " للمجموعة، ما في خروج بهالسهولة 😄"]));
            // فشلت الإعادة (حظر أو إعدادات خصوصية): نكمل بالتوديع العادي
        }
        if (!isOn(store, "farewell", threadID, true)) return;
        return ctx.send(voluntary ? "👋 " + name + " غادر المجموعة. نتمنى له التوفيق 🌸" : "🚪 " + name + " خرج من المجموعة (بقرار من الإدارة).");
    }
};
