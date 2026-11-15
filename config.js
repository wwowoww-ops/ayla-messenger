// إعدادات آيلا ماسنجر. القيم النائبة تبدأ بـ "ضع_" وتُتجاهل. متغيرات البيئة لها الأولوية إن وُجدت.
module.exports = {
    botName: "آيلا",
    prefix: ".",

    // معرّفات فيسبوك (UID) للمطوّرين. الأول هو "أبو هريرة" ويُعامَل معاملة خاصة من آيلا.
    owners: ["61594221091809"],

    // مفتاح مزوّد الذكاء الاصطناعي (نفس مفتاح apiKey2 المستعمل في زنجوبة / بوت تيليجرام)
    aiKey: "ضع_مفتاح_AI_هنا",
    aiUrl: "https://gfcco2htytcmx37orxkzgm67eu0xcrcf.lambda-url.ap-northeast-2.on.aws",
    aiModel: "claude",
    aiNPredict: 180,

    // قاعدة بيانات اختيارية (Postgres/Neon). إن تُركت فارغة تُحفظ البيانات في data/store.json
    databaseUrl: "ضع_رابط_القاعدة_هنا",

    // ملف الجلسة (appstate) أو متغير البيئة APPSTATE
    appStatePath: "appstate.json"
};
