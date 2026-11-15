// وضع الصمت: يحذّر غير الأدمن إذا تكلم، ويطرده عند المخالفة الثانية. (فيسبوك لا يسمح للبوت بحذف رسائل غيره)
module.exports = {
    name: "صمت", aliases: ["الكلام", "mute"], level: 1, scope: "group", cooldown: 3,
    description: "منع الكلام على غير الأدمن (تحذير ثم طرد)", usage: "صمت تشغيل | صمت ايقاف",
    async run(ctx) {
        const k = "mute:" + ctx.event.threadID, a = (ctx.args[0] || "").toLowerCase();
        if (/^(تشغيل|on)$/.test(a)) {
            if (!(await ctx.perms.botIsAdmin(ctx.api, ctx.event.threadID))) return ctx.reply("لازم أكون أدمن حتى يعمل الصمت 🌸");
            ctx.store.set(k, true); return ctx.reply("تم تفعيل الصمت: من يتكلم من غير الأدمن يُحذَّر ثم يُطرد.");
        }
        if (/^(ايقاف|إيقاف|off)$/.test(a)) { ctx.store.del(k); return ctx.reply("تم إيقاف الصمت 🌸"); }
        return ctx.reply("الصمت حاليًا: " + (ctx.store.get(k) ? "مفعّل" : "متوقف") + "\nالاستعمال: صمت تشغيل | صمت ايقاف");
    }
};
