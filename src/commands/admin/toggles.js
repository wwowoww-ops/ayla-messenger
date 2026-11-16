const { makeToggle } = require("../../lib/toggle");
module.exports = [
    makeToggle({ name: "ترحيب", aliases: ["welcome"], flag: "welcome", label: "الترحيب بالأعضاء الجدد", defaultOn: true, description: "تشغيل/إيقاف رسالة الترحيب" }),
    makeToggle({ name: "توديع", aliases: ["farewell"], flag: "farewell", label: "التوديع عند خروج عضو", defaultOn: true, description: "تشغيل/إيقاف رسالة التوديع عند خروج أو طرد عضو" }),
    makeToggle({ name: "منع_الخروج", aliases: ["antiout"], flag: "antiout", label: "منع الخروج (إعادة من يخرج بنفسه)", defaultOn: true, description: "إعادة العضو تلقائيًا إذا خرج من المجموعة بنفسه" })
];
