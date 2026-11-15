// أوامر الصور: فردية (صورتك أو صورة المستهدف) وثنائية (أنت + المستهدف). القوالب في src/lib/cards.js
const img = require("../../lib/img");
const { single, dual } = require("../../lib/cards");
const { pick, hash } = require("../../lib/util");

async function who(ctx) { // المستهدف إن وُجد وإلا المرسل نفسه
    const t = await ctx.target();
    if (t) return t;
    const id = String(ctx.event.senderID);
    return { id, name: await ctx.nameOf(id) };
}
const mk = (name, aliases, key, caption, opts) => ({
    name, aliases, level: 0, cooldown: 12,
    description: "صورة " + name + " (لك أو لمن تذكره)", usage: name + " [@منشن | بالرد]",
    async run(ctx) {
        const t = await who(ctx);
        const av = await img.avatar(ctx.api, t.id, t.name, 512);
        const buf = await single[key]([av], opts);
        const m = ctx.mention([caption + " ", { id: t.id, name: t.name }]);
        return img.sendImage(ctx.api, buf, m.body, ctx.event.threadID, ctx.event.messageID, m.mentions);
    }
});

// ثنائي: النتيجة صورة + نص فيه المنشن. action اختياري يُنفَّذ قبل الإرسال ويعيد نصًا إضافيًا أو false للإلغاء
const mk2 = (name, aliases, key, verb, lines, action) => ({
    name, aliases, level: 0, scope: "group", cooldown: 12,
    description: name + " مع شخص (ترفيه، بصورة)", usage: name + " @منشن | بالرد",
    async run(ctx) {
        const me = String(ctx.event.senderID);
        const t = await ctx.target();
        if (!t) return ctx.reply("مع من؟ " + name + " @منشن (أو ردّ على رسالته).");
        if (t.id === me) return ctx.reply("اختر شخصًا غيرك 😅");
        let extra = "";
        if (action) { const r = await action(ctx, me, t); if (r === false) return; extra = r || ""; }
        const myName = await ctx.nameOf(me);
        const [a, b] = await Promise.all([img.avatar(ctx.api, me, myName, 400), img.avatar(ctx.api, t.id, t.name, 400)]);
        const buf = await dual[key]([a, b]);
        const m = ctx.mention([{ id: me, name: myName }, " " + verb + " ", { id: t.id, name: t.name }, " " + pick(lines) + extra]);
        return img.sendImage(ctx.api, buf, m.body, ctx.event.threadID, ctx.event.messageID, m.mentions);
    }
});

const marryAction = async (ctx, me, t) => {
    if (t.id === String(ctx.api.getCurrentUserID())) { await ctx.reply("أنا؟ لا يا حلو، خلّني بعيدة 🌸"); return false; }
    if (ctx.store.get("marry:" + me)) { await ctx.reply("أنت متزوج أصلًا! اكتب طلاق أولًا."); return false; }
    if (ctx.store.get("marry:" + t.id)) { await ctx.reply(t.name + " متزوج/ة من شخص آخر."); return false; }
    const at = Date.now();
    ctx.store.set("marry:" + me, { spouse: t.id, name: t.name, at });
    ctx.store.set("marry:" + t.id, { spouse: me, name: await ctx.nameOf(me), at });
    return "";
};

const zawjini = {
    name: "زوجيني", aliases: ["عشوائي", "randommarry"], level: 0, scope: "group", cooldown: 20,
    description: "يزوّجك بعضو عشوائي من المجموعة مع نسبة الحب (للتسلية)", usage: "زوجيني",
    async run(ctx) {
        const me = String(ctx.event.senderID), botId = String(ctx.api.getCurrentUserID());
        if (ctx.store.get("marry:" + me)) return ctx.reply("أنت متزوج أصلًا! اكتب طلاق أولًا.");
        const info = await ctx.api.getThreadInfo(String(ctx.event.threadID)).catch(() => null);
        const pool = ((info && info.participantIDs) || []).map(String).filter(id => id !== me && id !== botId && !ctx.store.get("marry:" + id));
        if (!pool.length) return ctx.reply("ما لقيت أحدًا متاحًا للزواج في المجموعة.");
        const pid = pick(pool), pname = await ctx.nameOf(pid), myName = await ctx.nameOf(me);
        const pct = hash([me, pid].sort().join("-")) % 101;
        const at = Date.now();
        ctx.store.set("marry:" + me, { spouse: pid, name: pname, at });
        ctx.store.set("marry:" + pid, { spouse: me, name: myName, at });
        const [a, b] = await Promise.all([img.avatar(ctx.api, me, myName, 400), img.avatar(ctx.api, pid, pname, 400)]);
        const m = ctx.mention(["💍 زواج عشوائي! ", { id: me, name: myName }, " و ", { id: pid, name: pname }, " — نسبة الحب " + pct + "% 💖"]);
        return img.sendImage(ctx.api, (await require("../../lib/cards").hinaCard("zawjini", [a, b])) || await dual.marry([a, b]), m.body, ctx.event.threadID, ctx.event.messageID, m.mentions);
    }
};

module.exports = [
    mk("مطلوب", ["wanted"], "wanted", "🔎 مطلوب حيًّا أو ميتًا:"),
    mk("قبر", ["rip"], "grave", "🪦 رحمه الله:"),
    mk("سجن", ["jail"], "jail", "🔒 في السجن:"),
    mk("شهادة", ["cert"], "cert", "📜 شهادة تقدير لـ"),
    mk("هوية", ["بطاقة", "idcard"], "id", "🪪 بطاقة هوية:"),
    mk("ملك", ["king"], "king", "👑 الملك:"),
    mk("ملكة", ["queen"], "king", "👸 الملكة:", { queen: true }),
    mk("عملة", ["coin"], "coin", "🪙 عملة تذكارية:"),
    mk("مجلة", ["غلاف", "magazine"], "magazine", "📰 على غلاف المجلة:"),
    mk2("زواج", ["تزوج", "marry"], "marry", "يتزوج", ["الله يتمم لكم 🌸", "بالرفاء والبنين 💖", "عقبال الأولاد 😄"], marryAction),
    zawjini,
    mk2("حضن", ["عناق", "hug"], "hug", "يحتضن", ["حضن دافئ 🌸", "حضنة طويلة 💖"]),
    mk2("بوسة", ["قبلة", "kiss"], "kiss", "يبوس", ["بوسة على الجبين 🌸", "بوسة خجولة 💖"]),
    mk2("صداقة", ["صديق", "friend"], "friend", "صار صديقًا لـ", ["صداقة للأبد 🤝", "أفضل صديقين 💙"]),
    mk2("مواجهة", ["vs", "تحدي"], "vs", "يواجه", ["من سيفوز؟ ⚔️", "جولة نارية 🔥"]),
    mk2("صفع", ["صفعة", "slap"], "slap", "يصفع", ["على سبيل المزح فقط 😅", "طراااخ! 👋"])
];
