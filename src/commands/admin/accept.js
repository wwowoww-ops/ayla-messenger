// قبول: إدارة طلبات انضمام الأعضاء المعلّقة (تحتاج أن تكون المجموعة بوضع الموافقة وأن يكون البوت أدمن)
const { sleep } = require("../../lib/util");
const MAX_ALL = 30;
const add = (api, uid, tid) => new Promise((res, rej) => api.addUserToGroup(String(uid), String(tid), e => e ? rej(e) : res()));
const queueOf = async (api, tid) => { const i = await api.getThreadInfo(String(tid)); return (i && Array.isArray(i.approvalQueue) ? i.approvalQueue : []).map(r => String(r.requesterID || r.id || r.userID || "")).filter(Boolean); };
const nameOf = async (ctx, id) => { try { return await ctx.nameOf(id); } catch (e) { return "مستخدم"; } };
const reason = e => { const m = String((e && e.message) || e || ""); return /permission|admin/i.test(m) ? "ليست لدي صلاحية كافية، تأكد أنني أدمن." : /block/i.test(m) ? "المستخدم محظور أو حظر البوت." : (m || "خطأ غير معروف"); };

module.exports = {
    name: "قبول", aliases: ["accept"], level: 1, scope: "group", cooldown: 5,
    description: "عرض طلبات الانضمام المعلّقة وقبولها (واحد أو الكل)", usage: "قبول | قبول <رقم> | قبول الكل",
    async run(ctx) {
        const tid = String(ctx.event.threadID), p = ctx.prefix;
        if (!(await ctx.perms.botIsAdmin(ctx.api, tid))) return ctx.reply("⚠️ لا أملك صلاحية الأدمن في هذه المجموعة\n↳ اجعلني أدمن حتى أستطيع قبول الطلبات.");
        let q; try { q = await queueOf(ctx.api, tid); } catch (e) { return ctx.reply("❌ تعذّر جلب طلبات الانضمام الآن\n↳ " + reason(e)); }
        const a = String(ctx.args[0] || "").replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
        const usage = "📝 الاستعمال:\n• " + p + "قبول ← عرض القائمة\n• " + p + "قبول <رقم> ← قبول طلب واحد\n• " + p + "قبول الكل ← قبول كل الطلبات (حتى " + MAX_ALL + " في المرة)";

        if (!a || /^(قائمة|list)$/.test(a)) {
            if (!q.length) return ctx.reply("📭 لا توجد طلبات انضمام معلّقة\n↳ تأكد أن «الموافقة على الأعضاء الجدد» مفعّلة في إعدادات المجموعة.");
            let m = "📋 طلبات الانضمام (" + q.length + ")\n━━━━━━━━━━━━━━━━━━\n";
            for (let i = 0; i < Math.min(q.length, 20); i++) m += (i + 1) + ". " + await nameOf(ctx, q[i]) + "\n   🆔 " + q[i] + "\n";
            if (q.length > 20) m += "… و " + (q.length - 20) + " طلب آخر\n";
            return ctx.reply(m + "━━━━━━━━━━━━━━━━━━\n" + usage);
        }
        if (/^\d+$/.test(a)) {
            if (!q.length) return ctx.reply("📭 لا توجد طلبات معلّقة.");
            const i = parseInt(a, 10) - 1;
            if (i < 0 || i >= q.length) return ctx.reply("⚠️ رقم غير صحيح\n↳ اختر رقمًا بين 1 و " + q.length + "\n↳ اكتب " + p + "قبول لعرض القائمة.");
            const uid = q[i], name = await nameOf(ctx, uid);
            try { await add(ctx.api, uid, tid); }
            catch (e) { return ctx.reply("❌ فشل قبول " + name + "\n↳ السبب: " + reason(e)); }
            return ctx.reply(ctx.mention(["✅ تم قبول الطلب\n👤 ", { id: uid, name }, "\n🆔 " + uid + "\n📌 انضمّ إلى المجموعة."]));
        }
        if (/^(الكل|all)$/.test(a)) {
            if (!q.length) return ctx.reply("📭 لا توجد طلبات معلّقة.");
            const batch = q.slice(0, MAX_ALL);
            await ctx.reply("⏳ بدأت قبول " + batch.length + " طلب\n↳ أعمل ببطء بين كل طلب وآخر لحماية الحساب من التقييد.");
            let ok = 0, bad = 0;
            for (const uid of batch) {
                try { await add(ctx.api, uid, tid); ok++; } catch (e) { bad++; console.error("[قبول] " + uid + ":", e && e.message); }
                await sleep(2000 + Math.random() * 1500);
            }
            return ctx.send("✅ انتهى قبول الطلبات\n━━━━━━━━━━━━━━━━━━\n✔️ تم قبول: " + ok + "\n❌ فشل: " + bad + (q.length > batch.length ? "\n📌 تبقّى " + (q.length - batch.length) + " طلب، أعد كتابة " + p + "قبول الكل." : ""));
        }
        return ctx.reply(usage);
    }
};
