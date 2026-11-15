// وضع الصمت: يحذّر غير الأدمن إذا تكلم، ويطرده عند المخالفة الثانية. (فيسبوك لا يسمح للبوت بحذف رسائل غيره)
module.exports = {
    name: "صمت", aliases: ["الكلام", "mute"], level: 1, scope: "group", cooldown: 3,
    description: "منع الكلام على غير الأدمن (تحذير ثم طرد)", usage: "صمت تشغيل | صمت ايقاف",
    async run(ctx) {
        const k = "mute:" + ctx.event.threadID, a = (ctx.args[0] || "").toLowerCase();
        if (/^(تشغيل|on)$/.test(a)) {
            if (!(await ctx.perms.botIsAdmin(ctx.api, ctx.event.threadID))) return ctx.reply("⚠️ لا أملك صلاحية الأدمن في هذه المجموعة\n↳ الصمت يحتاج أن أكون أدمن لأطرد المخالفين.");
            ctx.store.set(k, true); return ctx.reply("🔇 تم تفعيل وضع الصمت\n↳ أول مخالفة من غير الأدمن: تحذير\n↳ المخالفة الثانية: طرد\n↳ للإيقاف اكتب: " + ctx.prefix + "صمت ايقاف");
        }
        if (/^(ايقاف|إيقاف|off)$/.test(a)) { ctx.store.del(k); return ctx.reply("🔊 تم إيقاف وضع الصمت\n↳ يستطيع الجميع الكلام الآن."); }
        return ctx.reply("🔇 حالة الصمت: " + (ctx.store.get(k) ? "مفعّل ✅" : "متوقف ❌") + "\n━━━━━━━━━━━━━━━━━━\n↳ للتفعيل: " + ctx.prefix + "صمت تشغيل\n↳ للإيقاف: " + ctx.prefix + "صمت ايقاف");
    }
};
