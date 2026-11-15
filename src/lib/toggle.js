// مفاتيح تشغيل/إيقاف لكل مجموعة: أمر واحد يُبنى من اسمه، ودالة isOn تقرؤه من الأحداث
const key = (name, thread) => "flag:" + name + ":" + thread;
const isOn = (store, name, thread, defaultOn) => { const v = store.get(key(name, thread)); return v === undefined ? !!defaultOn : v === true; };

function makeToggle({ name, aliases, flag, label, defaultOn, description }) {
    return {
        name, aliases: aliases || [], level: 1, scope: "group", cooldown: 3, category: "admin",
        description, usage: name + " تشغيل | " + name + " ايقاف",
        async run(ctx) {
            const a = ctx.args[0] || "", k = key(flag, ctx.event.threadID);
            if (/^(تشغيل|تفعيل|on)$/.test(a)) { ctx.store.set(k, true); return ctx.reply(label + ": تم التشغيل 🌸"); }
            if (/^(ايقاف|إيقاف|off)$/.test(a)) { ctx.store.set(k, false); return ctx.reply(label + ": تم الإيقاف."); }
            return ctx.reply(label + ": " + (isOn(ctx.store, flag, ctx.event.threadID, defaultOn) ? "مفعّل" : "متوقف") + "\n" + name + " تشغيل | " + name + " ايقاف");
        }
    };
}
module.exports = { makeToggle, isOn };
