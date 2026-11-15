// تطبيق وضع الصمت: غير الأدمن يُحذَّر أول مرة ويُطرد في الثانية (يحتاج أن يكون البوت أدمن)
const safety = require("../lib/safety");
module.exports = {
    name: "mute", pre: true, order: 10,
    async onMessage(ctx, info) {
        const { api, event, store, perms } = ctx;
        if (!event.isGroup || !store.get("mute:" + event.threadID)) return false;
        const sid = String(event.senderID);
        if (perms.isOwner(sid) || (await perms.levelOf(api, event)) >= 1) return false;
        const k = "mutewarn:" + event.threadID + ":" + sid;
        const n = (store.get(k, 0) || 0) + 1;
        if (n >= 2) {
            store.del(k);
            if (await perms.botIsAdmin(api, event.threadID) && safety.allowAction()) api.removeUserFromGroup(sid, String(event.threadID), () => {});
            return true;
        }
        store.set(k, n);
        await ctx.send(require("../lib/ui").withHeader(ctx.mention(["🔇 وضع الصمت مفعّل\n👤 ", { id: sid, name: await ctx.nameOf(sid) }, "\n⚠️ الكلام ممنوع الآن لغير الأدمن\n❗ المخالفة الثانية = طرد"]), "admin"));
        return true;
    }
};
