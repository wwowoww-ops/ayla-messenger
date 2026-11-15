// أوامر الصور: فردية (صورتك أو صورة المستهدف) وثنائية (أنت + المستهدف). القوالب في src/lib/cards.js
const img = require("../../lib/img");
const { single, dual, zawjiniCard } = require("../../lib/cards");
const { pick } = require("../../lib/util");
const FOOT = "\n✦ المطور: أبو هريرة";

async function who(ctx) { // المستهدف إن وُجد وإلا المرسل نفسه
    const t = await ctx.target();
    if (t) return t;
    const id = String(ctx.event.senderID);
    return { id, name: await ctx.nameOf(id) };
}
const out = (ctx, buf, m) => { const h = ctx.hdr(m); return img.sendImage(ctx.api, buf, h.body, ctx.event.threadID, ctx.event.messageID, h.mentions); };

const mk = (name, aliases, key, intro, lines, opts) => ({
    name, aliases, level: 0, category: "pic", cooldown: 12,
    description: "صورة «" + name + "» لك أو لمن تذكره", usage: name + " [@منشن | بالرد]",
    async run(ctx) {
        const t = await who(ctx);
        const me = String(ctx.event.senderID);
        const av = await img.avatar(ctx.api, t.id, t.name, 512);
        const buf = await single[key]([av], Object.assign({ uid: t.id }, opts));
        const by = t.id === me ? "صنعتَها لنفسك" : "طلبها " + (await ctx.nameOf(me));
        const m = ctx.mention([intro + "\n👤 ", { id: t.id, name: t.name }, "\n" + pick(lines) + "\n📌 " + by + FOOT]);
        return out(ctx, buf, m);
    }
});

// ثنائي: صورة + نص مفصّل فيه منشن للطرفين. action اختياري قبل الإرسال: يعيد نصًا إضافيًا أو false للإلغاء
const mk2 = (name, aliases, key, intro, lines, action) => ({
    name, aliases, level: 0, category: "pic", scope: "group", cooldown: 12,
    description: name + " مع شخص (بصورة)", usage: name + " @منشن | بالرد",
    async run(ctx) {
        const me = String(ctx.event.senderID);
        const t = await ctx.target();
        if (!t) return ctx.reply("❌ حدّد الشخص أولًا\n↳ " + ctx.prefix + name + " @منشن\n↳ أو ردّ على رسالته بالأمر نفسه");
        if (t.id === me) return ctx.reply("😅 اختر شخصًا غيرك، لا يمكن أن يكون الطرفان نفس الشخص.");
        let extra = "";
        if (action) { const r = await action(ctx, me, t); if (r === false) return; extra = r || ""; }
        const myName = await ctx.nameOf(me);
        const [a, b] = await Promise.all([img.avatar(ctx.api, me, myName, 400), img.avatar(ctx.api, t.id, t.name, 400)]);
        const buf = await dual[key]([a, b]);
        const m = ctx.mention([intro + "\n👤 ", { id: me, name: myName }, "\n💞 ", { id: t.id, name: t.name }, "\n" + pick(lines) + extra + FOOT]);
        return out(ctx, buf, m);
    }
});

const marryAction = async (ctx, me, t) => {
    if (t.id === String(ctx.api.getCurrentUserID())) { await ctx.reply("🌸 أنا؟ لا يا حلو، خلّني بعيدة عن هالسوالف."); return false; }
    if (ctx.store.get("marry:" + me)) { const s = ctx.store.get("marry:" + me); await ctx.reply("💍 أنت متزوج أصلًا من " + s.name + "!\n↳ اكتب " + ctx.prefix + "طلاق أولًا إن أردت الانفصال."); return false; }
    if (ctx.store.get("marry:" + t.id)) { await ctx.reply("💔 " + t.name + " متزوج/ة من شخص آخر بالفعل.\n↳ جرّب شخصًا غيره، أو " + ctx.prefix + "زوجيني للاختيار العشوائي."); return false; }
    const at = Date.now();
    ctx.store.set("marry:" + me, { spouse: t.id, name: t.name, at });
    ctx.store.set("marry:" + t.id, { spouse: me, name: await ctx.nameOf(me), at });
    return "\n📅 تاريخ العقد: " + new Intl.DateTimeFormat("ar-TN", { timeZone: "Africa/Tunis", dateStyle: "long" }).format(new Date()) + "\n🔎 اكتب " + ctx.prefix + "زوجي لتعرف شريك حياتك.";
};

const LOVE = p => p >= 90 ? "💖 توافق خيالي!" : p >= 75 ? "❤️ توافق رائع!" : p >= 60 ? "💕 توافق جيد!" : "💔 توافق متوسط!";
const zawjini = {
    name: "زوجيني", aliases: ["عشوائي", "randommarry"], level: 0, category: "pic", scope: "group", cooldown: 20,
    description: "يزوّجك بعضو عشوائي من المجموعة مع نسبة الحب", usage: "زوجيني",
    async run(ctx) {
        const me = String(ctx.event.senderID), botId = String(ctx.api.getCurrentUserID());
        if (ctx.store.get("marry:" + me)) return ctx.reply("💍 أنت متزوج أصلًا من " + ctx.store.get("marry:" + me).name + "!\n↳ اكتب " + ctx.prefix + "طلاق أولًا.");
        const info = await ctx.api.getThreadInfo(String(ctx.event.threadID)).catch(() => null);
        const pool = ((info && info.participantIDs) || []).map(String).filter(id => id !== me && id !== botId && !ctx.store.get("marry:" + id));
        if (!pool.length) return ctx.reply("😔 ما لقيت أحدًا متاحًا للزواج في هذه المجموعة (الكل متزوج أو لا يوجد أعضاء كفاية).");
        const pid = pick(pool), pname = await ctx.nameOf(pid), myName = await ctx.nameOf(me);
        const pct = 50 + Math.floor(Math.random() * 51); // 50–100 كما في Hina
        const at = Date.now();
        ctx.store.set("marry:" + me, { spouse: pid, name: pname, at });
        ctx.store.set("marry:" + pid, { spouse: me, name: myName, at });
        const [a, b] = await Promise.all([img.avatar(ctx.api, me, myName, 400), img.avatar(ctx.api, pid, pname, 400)]);
        const intro = pick(["ألف مبروك الزواج!", "تم الزواج! أصبحا زوجين!", "مبارك للعروسين!", "زواج سعيد!"]);
        const m = ctx.mention([intro + "\n👤 ", { id: me, name: myName }, "\n💍 ", { id: pid, name: pname }, "\n❤️ نسبة التوافق:\n" + pct + "%\n" + LOVE(pct) + FOOT]);
        return out(ctx, await zawjiniCard([a, b], pct), m);
    }
};

module.exports = [
    mk("مطلوب", ["wanted"], "wanted", "🔎 مطلوب حيًّا أو ميتًا!", ["💰 المكافأة: مليون دولار لمن يأتي به", "🚨 خطير جدًا، لا تقترب منه وحدك"]),
    mk("قبر", ["rip"], "grave", "🪦 رحمه الله وغفر له…", ["🕯️ كان طيبًا، سيفتقده الجميع", "🥀 مات ضحكه قبل جسده"]),
    mk("سجن", ["jail"], "jail", "🔒 تم القبض عليه!", ["⚖️ الحكم: مؤبد مع الأعمال الشاقة", "👮 التهمة: كثرة الكلام في المجموعة"]),
    mk("شهادة", ["cert"], "cert", "📜 شهادة تقدير رسمية", ["🏅 تُمنح تقديرًا لجهوده العظيمة", "🎖️ أسطورة معتمدة رسميًا"]),
    mk("هوية", ["بطاقة", "idcard"], "id", "🪪 بطاقة هوية جديدة", ["✅ البيانات موثّقة وسارية", "📋 صالحة لمدة ألف عام"]),
    mk("ملك", ["king"], "king", "👑 تتويج ملكي!", ["🏰 فليحيا الملك!", "⚔️ عرش المجموعة صار له"]),
    mk("ملكة", ["queen"], "king", "👸 تتويج ملكي!", ["🏰 فلتحيا الملكة!", "💎 تاج المجموعة صار لها"], { queen: true }),
    mk("عملة", ["coin"], "coin", "🪙 صدرت عملة تذكارية!", ["💰 نادرة جدًا، لا تُقدَّر بثمن", "✨ طبعة محدودة لأسطورة واحدة"]),
    mk("مجلة", ["غلاف", "magazine"], "magazine", "📰 على غلاف المجلة هذا الشهر!", ["📸 جلسة تصوير حصرية", "🌟 حوار شيّق في الداخل"]),
    mk2("زواج", ["تزوج", "marry"], "marry", "💍 طلب زواج وتم القبول!", ["الله يتمم لكم على خير 🌸", "بالرفاء والبنين 💖", "عقبال الأولاد 😄"], marryAction),
    zawjini,
    mk2("حضن", ["عناق", "hug"], "hug", "🤗 حضن دافئ!", ["حضن طويل يطرد كل الهموم 🌸", "أحيانًا الحضن أحسن علاج 💖"]),
    mk2("بوسة", ["قبلة", "kiss"], "kiss", "😘 بوسة حلوة!", ["بوسة على الجبين 🌸", "بوسة خجولة 💖"]),
    mk2("صداقة", ["صديق", "friend"], "friend", "🤝 صداقة جديدة!", ["صداقة للأبد 💙", "أفضل صديقين في المجموعة 🌟"]),
    mk2("مواجهة", ["vs", "تحدي"], "vs", "⚔️ مواجهة نارية!", ["من سيفوز يا ترى؟ 🔥", "جولة لا تُنسى 🥊"]),
    mk2("صفع", ["صفعة", "slap"], "slap", "👋 صفعة مدوية!", ["على سبيل المزح فقط 😅", "طراااخ! سمعها الجيران 💥"])
];
