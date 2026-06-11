import { NextRequest, NextResponse } from "next/server";

type Domain = "restaurant" | "shop" | "service" | "education" | "health";

type ContentTemplate = {
  captionPattern: string[];
  hashtags: string[];
  ctaPattern: string[];
};

const TEMPLATES: Record<Domain, ContentTemplate> = {
  restaurant: {
    captionPattern: [
      "🍽️ {input}\n\nهر لحظه‌ای که با ما می‌گذرانید، طعمی متفاوت از لذت است.\nمنوی متنوع، کیفیت عالی و فضایی دنج برای شما.",
      "👨‍🍳 {input}\n\nسفره‌ای از بهترین طعم‌ها را برایتان آماده کرده‌ایم.\nاز صبحانه تا شام، همراه شما هستیم.",
      "🌟 {input}\n\nرستوران ما، جایی برای لذت بردن از غذاهای اصیل.\nبا عشق و دقت برای شما آماده می‌کنیم.",
    ],
    hashtags: [
      "#رستوران",
      "#غذای_خوشمزه",
      "#آشپزی_ایرانی",
      "#کافه",
      "#فودپورن",
      "#غذای_سالم",
      "#رزرو_آنلاین",
      "#دلیوری",
      "#منوی_ویژه",
    ],
    ctaPattern: [
      "📞 برای رزرو با ما تماس بگیرید یا از دایرکت پیام بدهید",
      "💬 برای سفارش همین حالا به دایرکت پیام بدهید",
      "🎯 رزرو آنلاین با یک پیام — منتظر شما هستیم",
    ],
  },
  shop: {
    captionPattern: [
      "🛍️ {input}\n\nجدیدترین محصولات با بهترین کیفیت در فروشگاه ما.\nخرید آسان و ارسال سریع به سراسر کشور.",
      "✨ {input}\n\nکالکشن جدید ما اینجاست!\nتنوع بالا، قیمت مناسب و کیفیت تضمینی.",
      "💎 {input}\n\nبهترین انتخاب برای خرید امروز شما.\nاعتماد شما، سرمایه ماست.",
    ],
    hashtags: [
      "#فروشگاه",
      "#خرید_آنلاین",
      "#محصولات_اصل",
      "#تخفیف_ویژه",
      "#ارسال_رایگان",
      "#کالکشن_جدید",
      "#کیفیت_برتر",
      "#پرداخت_درب_منزل",
    ],
    ctaPattern: [
      "📦 برای سفارش به دایرکت پیام بدهید",
      "💬 موجودی و قیمت را از دایرکت بپرسید",
      "🛒 سفارش خود را همین الان ثبت کنید",
    ],
  },
  service: {
    captionPattern: [
      "💼 {input}\n\nخدمات حرفه‌ای با تیمی مجرب و متعهد.\nکیفیت کار و رضایت شما اولویت ماست.",
      "⚡ {input}\n\nسریع، دقیق و قابل اعتماد.\nهمین امروز با ما تماس بگیرید.",
      "🎯 {input}\n\nراه‌حل‌های هوشمند برای نیازهای شما.\nمشاوره رایگان — خدمات حرفه‌ای.",
    ],
    hashtags: [
      "#خدمات",
      "#خدمات_حرفه‌ای",
      "#کیفیت_برتر",
      "#مشاوره_رایگان",
      "#سرویس_سریع",
      "#متخصص",
      "#قابل_اعتماد",
    ],
    ctaPattern: [
      "📞 برای دریافت مشاوره رایگان با ما تماس بگیرید",
      "💬 سوالات خود را از دایرکت بپرسید",
      "🎯 همین الان درخواست خود را ثبت کنید",
    ],
  },
  education: {
    captionPattern: [
      "📚 {input}\n\nیادگیری با کیفیت، آینده‌ای روشن.\nدوره‌های آموزشی ما با اساتید مجرب و محتوای به‌روز.",
      "🎓 {input}\n\nیاد بگیرید، رشد کنید، موفق شوید.\nآموزش گام‌به‌گام با پشتیبانی کامل.",
      "✨ {input}\n\nدانش و مهارت، کلید موفقیت.\nبهترین دوره‌های آموزشی اینجاست.",
    ],
    hashtags: [
      "#آموزش",
      "#آموزش_آنلاین",
      "#دوره_آموزشی",
      "#یادگیری",
      "#مهارت_آموزی",
      "#استاد_مجرب",
      "#گواهینامه_معتبر",
    ],
    ctaPattern: [
      "📖 برای ثبت‌نام به دایرکت پیام بدهید",
      "💬 جزئیات دوره را از دایرکت بپرسید",
      "🎯 همین الان ثبت‌نام کنید و شروع کنید",
    ],
  },
  health: {
    captionPattern: [
      "🏥 {input}\n\nسلامتی شما، اولویت ماست.\nخدمات پزشکی با بالاترین استانداردها و تجهیزات مدرن.",
      "💊 {input}\n\nمراقبت حرفه‌ای برای زندگی سالم‌تر.\nتیم پزشکی مجرب در خدمت شما.",
      "🩺 {input}\n\nبهترین مراقبت‌های بهداشتی و درمانی.\nبا اطمینان به ما مراجعه کنید.",
    ],
    hashtags: [
      "#سلامت",
      "#بهداشت",
      "#کلینیک",
      "#پزشک_متخصص",
      "#مراقبت_سلامت",
      "#درمان",
      "#تجهیزات_پزشکی",
    ],
    ctaPattern: [
      "📞 برای نوبت‌گیری با ما تماس بگیرید",
      "💬 برای مشاوره رایگان به دایرکت پیام بدهید",
      "🎯 همین الان وقت ویزیت رزرو کنید",
    ],
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain, input } = body as { domain: Domain; input: string };

    if (!domain || !input) {
      return NextResponse.json({ ok: false, error: "حوزه کاری و توضیحات الزامی است." });
    }

    if (!TEMPLATES[domain]) {
      return NextResponse.json({ ok: false, error: "حوزه کاری نامعتبر است." });
    }

    const template = TEMPLATES[domain];

    // انتخاب تصادفی یکی از الگوهای کپشن
    const captionPattern = template.captionPattern[Math.floor(Math.random() * template.captionPattern.length)];
    const caption = captionPattern.replace("{input}", input.trim());

    // انتخاب 5-7 هشتگ تصادفی
    const shuffledHashtags = [...template.hashtags].sort(() => Math.random() - 0.5);
    const selectedHashtagsCount = 5 + Math.floor(Math.random() * 3); // 5 تا 7
    const hashtags = shuffledHashtags.slice(0, selectedHashtagsCount);

    // انتخاب تصادفی یکی از الگوهای CTA
    const cta = template.ctaPattern[Math.floor(Math.random() * template.ctaPattern.length)];

    return NextResponse.json({
      ok: true,
      content: {
        caption,
        hashtags,
        cta,
      },
    });
  } catch (error) {
    console.error("[content-api]", error);
    return NextResponse.json({ ok: false, error: "خطای سرور در تولید محتوا." });
  }
}
