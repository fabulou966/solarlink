// ─── Bilingual dictionary (ported from starter) ─────────────────

export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ar";

export function isLocale(v: string): v is Locale {
  return (locales as readonly string[]).includes(v);
}

export const dict = {
  ar: {
    dir: "rtl" as const,
    nav1: "الخدمات",
    nav2: "أعمالنا",
    nav3: "تواصل معنا",
    h1: "اجعل الشمس مصدر كهرباء بيتك",
    hp: "تركيب أنظمة الطاقة الشمسية ودعم فني من مهندسين، من أول معاينة حتى التشغيل والصيانة.",
    cta: "اطلب عرض سعر مجاني",
    cta2: "شاهد أعمالنا",
    s_t: "خدماتنا",
    s_s: "نركّب النظام ونبقى معك بعد التشغيل.",
    s1t: "التركيب",
    s1d: "تصميم النظام المناسب لاستهلاكك، وتركيب الألواح والإنفرتر والبطاريات بشكل آمن ومطابق للمواصفات.",
    s2t: "الدعم الفني",
    s2d: "فحص الأعطال، ضبط الإنفرتر والبطاريات، وصيانة دورية للحفاظ على أداء النظام.",
    p_t: "أعمالنا",
    p_s: "من مشاريعنا المنجزة.",
    c_t: "اطلب عرض سعر",
    c_s: "أرسل بياناتك وسنرد عليك عبر واتساب.",
    fn: "الاسم",
    fp: "رقم الهاتف",
    fc: "المدينة",
    fm: "ماذا تحتاج؟ (مثال: نظام لمنزل، صيانة إنفرتر)",
    send: "إرسال الطلب",
    thanks: "شكرًا، تم استلام طلبك وسنتواصل معك قريبًا.",
    errRequired: "الاسم ورقم الهاتف مطلوبان.",
    errLong: "أحد الحقول أطول من الحد المسموح.",
    errRate: "تم إرسال عدد كبير من الطلبات. حاول مرة أخرى بعد قليل.",
    errGeneric: "حدث خطأ غير متوقع. حاول مرة أخرى.",
    nowa: "رقم واتساب غير مضاف بعد. أضفه في إعدادات الموقع (site.ts).",
    share: "مشاركة",
    shareWa: "واتساب",
    shareFb: "فيسبوك",
    shareX: "X",
    copyLink: "نسخ الرابط",
    copied: "تم نسخ الرابط",
    close: "إغلاق",
    prevImg: "الصورة السابقة",
    nextImg: "الصورة التالية",
    ph: "صورة المشروع",
    wm: "مرحبا، أريد عرض سعر لنظام طاقة شمسية.",
    wn: "الاسم",
    wp: "الهاتف",
    wc: "المدينة",
    // SEO
    title: "SolarLink | سولار لينك — تركيب أنظمة الطاقة الشمسية ودعم فني",
    description: "تركيب أنظمة الطاقة الشمسية ودعم فني من مهندسين: تصميم النظام، الألواح والإنفرتر والبطاريات، الصيانة الدورية. اطلب عرض سعر مجاني.",
    // misc
    backHome: "عودة للرئيسية",
    details: "التفاصيل",
    systemSize: "حجم النظام",
    equipment: "المعدات",
    photos: "الصور",
    downloadBoq: "تحميل جدول الكميات (BOQ)",
    boqMissing: "ملف BOQ غير متوفر لهذا المشروع",
    // About
    aboutTitle: "من نحن",
    aboutText:
      "SolarLink متخصصة في تركيب أنظمة الطاقة الشمسية والدعم الفني. نصمم النظام المناسب لاستهلاكك، ونركّبه ونشغّله، ونبقى معك للصيانة وحل الأعطال. نخدم Omdurman.",
    // How we work
    howTitle: "كيف نعمل",
    howSteps: [
      "1. المعاينة: نفهم احتياجك ونزور الموقع.",
      "2. التصميم وعرض السعر: نحدد حجم النظام والمعدات ونرسل لك عرضًا واضحًا.",
      "3. التركيب: نركّب الألواح والإنفرتر والبطاريات وحماية النظام.",
      "4. التشغيل والفحص: نشغّل النظام ونتأكد من عمله ونشرح لك طريقة الاستخدام.",
      "5. الدعم الفني: نتابع معك للصيانة وحل أي عطل.",
    ],
    // FAQ
    faqTitle: "أسئلة شائعة",
    faq: [
      {
        q: "كيف أحصل على عرض سعر؟",
        a: "أرسل بياناتك عبر النموذج أو واتساب، وسنتواصل معك لفهم احتياجك وترتيب المعاينة.",
      },
      {
        q: "ما حجم النظام المناسب لي؟",
        a: "يعتمد على استهلاكك وأجهزتك ومساحة التركيب، ونحدده معك أثناء المعاينة.",
      },
      {
        q: "كم يستغرق التركيب؟",
        a: "يختلف حسب حجم النظام وموقعه، ونذكر المدة المتوقعة في عرض السعر.",
      },
      {
        q: "هل تقدمون دعمًا فنيًا بعد التركيب؟",
        a: "نعم، نقدم دعمًا فنيًا وصيانة وحل أعطال.",
      },
    ],
    // Contact
    contactTitle: "تواصل معنا",
    contactWhatsapp: "واتساب: +249117027936",
    contactEmail: "البريد: solarlinksd@gmail.com",
    contactArea: "المنطقة: Omdurman",
    // Privacy page
    privacyTitle: "سياسة الخصوصية",
    privacyBody: [
      "عندما ترسل طلب عرض سعر عبر هذا الموقع، نحفظ الاسم ورقم الهاتف والمدينة ورسالتك. نستخدم هذه البيانات فقط للرد عليك وترتيب الخدمة التي طلبتها.",
      "لا نبيع بياناتك ولا نشاركها مع أي جهة لأغراض إعلانية.",
      "تُخزَّن البيانات لدى مزوّدي الاستضافة وقواعد البيانات الذين نستخدمهم لتشغيل الموقع.",
      "يمكنك طلب حذف بياناتك في أي وقت عبر التواصل معنا على واتساب أو البريد الإلكتروني.",
    ],
  },
  en: {
    dir: "ltr" as const,
    nav1: "Services",
    nav2: "Our work",
    nav3: "Contact",
    h1: "Let the sun power your home",
    hp: "Solar installation and expert technical support, from the first site visit to commissioning and maintenance.",
    cta: "Get a free quote",
    cta2: "See our work",
    s_t: "Our services",
    s_s: "We install the system and stay with you after it’s running.",
    s1t: "Installation",
    s1d: "A system sized to your consumption, with panels, inverter and batteries installed safely and to standard.",
    s2t: "Technical support",
    s2d: "Fault diagnosis, inverter and battery configuration, and regular maintenance to keep performance high.",
    p_t: "Our work",
    p_s: "A selection of our completed projects.",
    c_t: "Request a quote",
    c_s: "Send your details and we’ll reply on WhatsApp.",
    fn: "Name",
    fp: "Phone number",
    fc: "City",
    fm: "What do you need? (e.g. home system, inverter service)",
    send: "Send request",
    thanks: "Thank you, we received your request and will contact you soon.",
    errRequired: "Name and phone number are required.",
    errLong: "One of the fields is too long.",
    errRate: "Too many requests sent. Please try again later.",
    errGeneric: "Something went wrong. Please try again.",
    nowa: "WhatsApp number not added yet. Set it in the site settings (site.ts).",
    share: "Share",
    shareWa: "WhatsApp",
    shareFb: "Facebook",
    shareX: "X",
    copyLink: "Copy link",
    copied: "Link copied",
    close: "Close",
    prevImg: "Previous photo",
    nextImg: "Next photo",
    ph: "Project photo",
    wm: "Hello, I’d like a quote for a solar system.",
    wn: "Name",
    wp: "Phone",
    wc: "City",
    // SEO
    title: "SolarLink — Solar installation & technical support",
    description: "Solar installation and expert technical support: system design, panels, inverters and batteries, plus regular maintenance. Get a free quote.",
    // misc
    backHome: "Back to home",
    details: "Details",
    systemSize: "System size",
    equipment: "Equipment",
    photos: "Photos",
    downloadBoq: "Download BOQ",
    boqMissing: "No BOQ file available for this project yet",
    // About
    aboutTitle: "About us",
    aboutText:
      "SolarLink specializes in solar system installation and technical support. We size the system to your consumption, install and commission it, and stay with you for maintenance and fault finding. We serve Omdurman.",
    // How we work
    howTitle: "How we work",
    howSteps: [
      "1. Site visit: we understand your needs and visit the site.",
      "2. Design and quote: we size the system and equipment and send a clear quote.",
      "3. Installation: we install the panels, inverter, batteries and protection.",
      "4. Commissioning: we start the system, check it works and show you how to use it.",
      "5. Support: we stay available for maintenance and fault finding.",
    ],
    // FAQ
    faqTitle: "FAQ",
    faq: [
      {
        q: "How do I get a quote?",
        a: "Send your details through the form or WhatsApp and we will contact you to understand your needs and arrange a site visit.",
      },
      {
        q: "What system size do I need?",
        a: "It depends on your consumption, your appliances and the installation space. We work it out with you during the site visit.",
      },
      {
        q: "How long does installation take?",
        a: "It depends on the system size and location. We give the expected time in the quote.",
      },
      {
        q: "Do you offer technical support after installation?",
        a: "Yes, we provide technical support, maintenance and fault finding.",
      },
    ],
    // Contact
    contactTitle: "Contact",
    contactWhatsapp: "WhatsApp: +249117027936",
    contactEmail: "Email: solarlinksd@gmail.com",
    contactArea: "Area: Omdurman",
    // Privacy page
    privacyTitle: "Privacy policy",
    privacyBody: [
      "When you send a quote request through this site, we store your name, phone number, city and message. We use this data only to reply to you and arrange the service you asked for.",
      "We do not sell your data or share it for advertising.",
      "The data is stored with the hosting and database providers we use to run the site.",
      "You can ask us to delete your data at any time by contacting us on WhatsApp or email.",
    ],
  },
};

export type Dict = (typeof dict)[Locale];
