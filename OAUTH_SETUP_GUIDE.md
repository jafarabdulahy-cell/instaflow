<div dir="rtl" align="right">

# راهنمای راه‌اندازی OAuth اتصال اینستاگرام

**تاریخ**: 11 ژوئن 2026  
**وضعیت**: ✅ کد کامل شد - آماده تست

---

## ✅ کارهای انجام شده

### 1. API Endpoints
- ✅ `/api/auth/instagram/start` - شروع OAuth
- ✅ `/api/auth/instagram/callback` - دریافت code و تبدیل به token
- ✅ `/api/auth/instagram/pages` - لیست صفحات
- ✅ `/api/auth/instagram/connect` - اتصال نهایی

### 2. صفحات UI
- ✅ `/dashboard/settings/connection` - صفحه اصلی اتصال
- ✅ `/dashboard/settings/connection/select-page` - انتخاب پیج

### 3. امنیت و رمزگذاری
- ✅ `src/lib/encryption.ts` - رمزگذاری Token با AES-256
- ✅ CSRF Protection با OAuth state
- ✅ Long-Lived Token (60 روز)

### 4. دیتابیس
- ✅ جدول `OAuthSession` برای ذخیره موقت
- ✅ فیلد `tokenExpiresAt` در `InstagramAccount`
- ✅ رمزگذاری `accessToken`

### 5. Build
- ✅ موفق: 14.6s
- ✅ 50 صفحه
- ✅ بدون خطا

---

## 🚀 مراحل راه‌اندازی

### مرحله 1: ساخت Meta App

1. برو به: https://developers.facebook.com/apps
2. کلیک روی **"Create App"**
3. نوع App را انتخاب کن: **"Business"**
4. نام App: **"InstaFlow"** (یا هر نام دیگر)
5. ایمیل تماس و مشخصات را وارد کن
6. کلیک روی **"Create App"**

---

### مرحله 2: افزودن Products

#### A. Facebook Login:
1. در Dashboard، از منوی چپ **"Add Product"** را انتخاب کن
2. **"Facebook Login"** را پیدا کن و **"Set Up"** کن
3. در تنظیمات Facebook Login:
   - **Valid OAuth Redirect URIs** را اضافه کن:
     ```
     http://localhost:3000/api/auth/instagram/callback
     https://yourdomain.com/api/auth/instagram/callback
     ```
   - ذخیره کن

#### B. Instagram Graph API:
1. از منوی چپ **"Add Product"** را دوباره انتخاب کن
2. **"Instagram"** یا **"Instagram Graph API"** را پیدا کن
3. **"Set Up"** کن
4. مراحل راهنما را دنبال کن

---

### مرحله 3: دریافت App ID و Secret

1. در Dashboard، از منوی چپ **"Settings"** → **"Basic"** را انتخاب کن
2. **App ID** را کپی کن
3. **App Secret** را Show کرده و کپی کن
4. این مقادیر را یادداشت کن

---

### مرحله 4: تنظیم متغیرهای محیطی

فایل `.env` یا `.env.local` را ویرایش کن:

```env
# Meta OAuth Configuration
META_APP_ID="12345678901234"
META_APP_SECRET="abcdef1234567890abcdef1234567890"
META_REDIRECT_URI="http://localhost:3000/api/auth/instagram/callback"

# Token Encryption Key (32 bytes = 64 hex characters)
TOKEN_ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
```

**نکته**: برای تولید `TOKEN_ENCRYPTION_KEY`:
```bash
# در terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### مرحله 5: تست در Development

#### A. اجرای سرور:
```bash
npm run dev
```

#### B. باز کردن صفحه اتصال:
```
http://localhost:3000/dashboard/settings/connection
```

#### C. کلیک روی "اتصال به اینستاگرام"

**انتظار**: باید به صفحه OAuth Meta redirect شود

---

### مرحله 6: حل مشکلات رایج

#### مشکل 1: "OAuth configuration not set"
**علت**: متغیرهای محیطی ست نشده  
**راه‌حل**: 
- مطمئن شو `.env.local` ساخته شده
- سرور را restart کن: `npm run dev`

#### مشکل 2: "redirect_uri_mismatch"
**علت**: Redirect URI در Meta App Dashboard ست نشده  
**راه‌حل**: 
- برو به: App Dashboard → Facebook Login → Settings
- اضافه کن: `http://localhost:3000/api/auth/instagram/callback`
- ذخیره و دوباره تست کن

#### مشکل 3: "invalid_client"
**علت**: App ID یا App Secret اشتباه است  
**راه‌حل**: 
- دوباره از Meta Dashboard کپی کن
- مطمئن شو فاصله اضافی نداشته باشد

#### مشکل 4: "access_denied"
**علت**: کاربر اتصال را لغو کرده یا permission نداده  
**راه‌حل**: 
- دوباره تلاش کن
- همه permissions را Allow کن

#### مشکل 5: "این صفحه به Instagram Business متصل نیست"
**علت**: صفحه Facebook به Instagram Business Account متصل نیست  
**راه‌حل**: 
1. برو به: https://www.facebook.com/settings?tab=business_tools
2. صفحه را به Instagram Business Account وصل کن
3. دوباره OAuth را امتحان کن

---

## 🔍 بررسی اتصال

### 1. بررسی دیتابیس:
```bash
npx prisma studio
```

بررسی کن:
- جدول `InstagramAccount` - آیا رکورد جدید ساخته شده؟
- فیلد `accessToken` - آیا رمزگذاری شده؟ (باید شامل `:` باشد)
- فیلد `isActive` - آیا `true` است؟

### 2. تست API:
```bash
# دریافت اطلاعات اتصال
curl http://localhost:3000/api/instagram/settings \
  -H "Cookie: session=YOUR_SESSION_COOKIE"
```

باید `configured: true` برگرداند.

---

## 📋 Checklist تست

- [ ] Meta App ساخته شد
- [ ] Facebook Login Product اضافه شد
- [ ] Instagram Graph API Product اضافه شد
- [ ] Redirect URI ست شد
- [ ] App ID و Secret در `.env` قرار گرفتند
- [ ] Encryption Key تولید و ست شد
- [ ] سرور راه‌اندازی شد (`npm run dev`)
- [ ] صفحه `/dashboard/settings/connection` باز می‌شود
- [ ] دکمه "اتصال به اینستاگرام" به Meta redirect می‌کند
- [ ] بعد از Allow، به صفحه انتخاب پیج می‌رود
- [ ] انتخاب پیج موفق است
- [ ] رکورد در دیتابیس ساخته شد
- [ ] Token رمزگذاری شده است
- [ ] پیج در `/dashboard/settings/connection` متصل نمایش داده می‌شود

---

## 🚨 نکات امنیتی مهم

### 1. در Production:
- ✅ حتماً `TOKEN_ENCRYPTION_KEY` ست کن
- ✅ حتماً `META_APP_SECRET` را امن نگه‌ دار
- ✅ از HTTPS استفاده کن
- ✅ Redirect URI باید HTTPS باشد

### 2. Token Management:
- Tokenها با AES-256-CBC رمزگذاری می‌شوند
- Long-Lived Tokens: 60 روز اعتبار
- در آینده: Cron job برای Refresh خودکار

### 3. CSRF Protection:
- هر OAuth request یک `state` تصادفی دارد
- State در cookie ذخیره می‌شود
- در callback بررسی می‌شود

---

## 🔄 مراحل بعدی (اختیاری)

### 1. Token Refresh خودکار:
```typescript
// Cron job روزانه برای Refresh
// در src/lib/cron/refresh-tokens.ts
```

### 2. قطع اتصال:
```typescript
// API endpoint: DELETE /api/auth/instagram/disconnect
```

### 3. Developer Mode:
```typescript
// صفحه مخفی: /dashboard/settings/connection/dev
// نمایش Token، ID، وضعیت فنی
```

### 4. Monitoring:
- لاگ کردن OAuth errors
- نوتیفیکیشن برای Token Expired
- Dashboard برای وضعیت اتصالات

---

## 📞 پشتیبانی

اگر مشکلی وجود داشت:

1. **بررسی Logs**:
   ```bash
   # در terminal که npm run dev اجرا شده
   ```

2. **بررسی Network Tab**:
   - باز کن: Chrome DevTools → Network
   - ببین چه API callها انجام می‌شود
   - خطاها را بررسی کن

3. **بررسی Meta App Dashboard**:
   - برو به: https://developers.facebook.com/apps
   - Check کن: Webhooks, Permissions, Products

---

## ✅ آماده برای Production

قبل از Production:

- [ ] Meta App را به Live/Production Mode ببر
- [ ] App Review برای permissions لازم
- [ ] Domain واقعی را به Redirect URIs اضافه کن
- [ ] SSL Certificate نصب شده
- [ ] Environment Variables در Production ست شده
- [ ] دیتابیس Production آماده است
- [ ] Backup Strategy وجود دارد
- [ ] Monitoring راه‌اندازی شده

---

**وضعیت فعلی**: ✅ کد کامل - آماده تست  
**مرحله بعدی**: راه‌اندازی Meta App و تست اتصال

</div>
