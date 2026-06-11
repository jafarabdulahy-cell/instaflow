# 🧪 راهنمای Mock Mode - InstaFlow

## Mock Mode چیست؟

Mock Mode یک حالت تستی است که به شما اجازه می‌دهد بدون نیاز به اتصال واقعی به Meta/Instagram API، کل برنامه را روی localhost تست کنید.

### مزایای Mock Mode:
- ✅ نیازی به VPN یا Proxy ندارید
- ✅ نیازی به Access Token واقعی ندارید
- ✅ نیازی به App Review یا Permission ندارید
- ✅ سریع و بدون محدودیت Rate Limit تست کنید
- ✅ UI، CRM، Rules و Auto Reply را بدون شبکه توسعه دهید

---

## فعال‌سازی Mock Mode

### گام ۱: تنظیم Environment Variable

در فایل `.env` خود، خط زیر را اضافه کنید:

```env
INSTAFLOW_USE_MOCK_META="true"
```

یا می‌توانید از این متغیر استفاده کنید:

```env
INSTAFLOW_META_MODE="mock"
```

### گام ۲: Restart سرور

```bash
npm run dev
```

---

## داده‌های Mock

Mock Mode شامل این داده‌های تستی است:

### پروفایل تستی:
- **Instagram ID**: `17841453193519327`
- **Username**: `shanshin.rest`
- **نام**: شانشین رستوران

### گفتگوهای تستی:
Mock Mode شامل **۷ گفتگوی تستی** با این پیام‌ها است:

1. "سلام، منو دارید؟" - علی رضایی
2. "میخوام رزرو کنم برای ۴ نفر" - سارا احمدی
3. "آدرس رستوران کجاست؟" - محمد کریمی
4. "ساعت کاری شما چیه؟" - زهرا حسینی
5. "قیمت غذاها چقدره؟" - رضا مرادی
6. "منو کامل" - مینا صفری
7. "سلام خوبید؟" - حسن جعفری

این پیام‌ها برای تست Rule Matching (کلمات کلیدی مثل "منو"، "رزرو"، "آدرس") طراحی شده‌اند.

---

## تست Mock Mode

### ۱. صفحه Connect
برو به: `http://localhost:3000/connect`

- روی دکمه **"تست عمیق"** کلیک کن
- باید عبارت **"🧪 Mock Mode"** در header نمایش داده شود
- نتایج تست باید موفق باشند و گفتگوهای تستی را نشان دهند

### ۲. صفحه Inbox
برو به: `http://localhost:3000/dashboard/inbox`

- گفتگوهای تستی را باید ببینی
- پیام‌های تستی نمایش داده می‌شوند

### ۳. Sync تستی
در صفحه Connect:

- روی دکمه **"Sync تستی یک گفتگو به لیدها"** کلیک کن
- پیام‌های Mock به دیتابیس اضافه می‌شوند
- می‌توانی در `/dashboard/leads` آن‌ها را ببینی

---

## غیرفعال کردن Mock Mode

برای بازگشت به حالت واقعی Meta API:

### گام ۱: حذف یا تغییر متغیر

در `.env`:

```env
INSTAFLOW_USE_MOCK_META="false"
```

یا خط را کامل حذف کنید.

### گام ۲: Restart سرور

```bash
npm run dev
```

---

## نکات مهم

### ⚠️ Mock Mode فقط برای Development است
- Mock Mode فقط برای توسعه لوکال است
- در Production/Railway باید خاموش باشد
- برای اتصال واقعی به Instagram، Mock Mode را غیرفعال کنید

### 🔄 کد واقعی Meta حفظ می‌شود
- Mock Mode کد واقعی را حذف نمی‌کند
- فقط یک لایه Mock روی API اضافه می‌کند
- وقتی Mock را خاموش کنید، اتصال واقعی Meta کار می‌کند

### 📝 Live Send در Mock Mode
- ارسال واقعی به Instagram در Mock Mode غیرفعال است
- پیام‌ها فقط در دیتابیس ذخیره می‌شوند
- برای تست Auto Reply در Mock، از Preview استفاده کنید

---

## فایل‌های مرتبط

- `src/lib/mock-instagram-data.ts` - داده‌های تستی Mock
- `src/lib/instagram-api.ts` - API wrapper با پشتیبانی Mock
- `.env` - تنظیمات Mock Mode

---

## سوالات متداول

**Q: آیا Mock Mode روی Railway کار می‌کند؟**  
A: بله، ولی نباید! Mock فقط برای local development است.

**Q: آیا می‌توانم داده‌های Mock را تغییر دهم؟**  
A: بله، فایل `src/lib/mock-instagram-data.ts` را ویرایش کنید.

**Q: آیا Auto Reply در Mock کار می‌کند؟**  
A: بله، Rule matching کار می‌کند ولی ارسال واقعی به Instagram انجام نمی‌شود.

**Q: چگونه بفهمم Mock Mode فعال است؟**  
A: در صفحه Connect عبارت "🧪 Mock Mode" نمایش داده می‌شود.

---

## مراحل بعدی

بعد از تست موفق Mock Mode:

1. ✅ Rule Builder را تست کنید
2. ✅ CRM و Leads را تست کنید  
3. ✅ Dashboard Analytics را تست کنید
4. ✅ همه feature‌ها را روی Mock کامل کنید
5. 🚀 در نهایت Mock را خاموش کرده و به Railway deploy کنید
