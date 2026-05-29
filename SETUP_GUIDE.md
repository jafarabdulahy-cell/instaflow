# راهنمای راه‌اندازی InstaFlow — فاز ۱

## ۱. کلون و نصب وابستگی‌ها

```bash
git clone https://github.com/your-repo/instaflow.git
cd instaflow
npm install
```

---

## ۲. ساخت Meta Developer App (مهم‌ترین مرحله)

### گام ۱ — ساخت App
1. برو به https://developers.facebook.com
2. از منوی بالا: **My Apps → Create App**
3. نوع: **Business**
4. نام App: `InstaFlow` (یا هر نام دیگری)

### گام ۲ — اضافه کردن Instagram Product
1. در داشبورد App، روی **Add Product** کلیک کن
2. **Instagram** را انتخاب کن
3. روی **Set Up** کلیک کن

### گام ۳ — تنظیم OAuth
1. در منوی چپ: **Instagram → Basic Display** یا **Instagram API with Instagram Login**
2. در بخش **Valid OAuth Redirect URIs** اضافه کن:
   ```
   https://your-app.vercel.app/api/auth/instagram/callback
   ```
3. همین آدرس را در **Deauthorize Callback URL** هم بگذار

### گام ۴ — گرفتن App ID و Secret
1. Settings → Basic
2. **App ID** و **App Secret** را کپی کن

### گام ۵ — تنظیم Webhook
1. در منوی چپ: **Webhooks**
2. روی **Add Callback URL** کلیک کن:
   ```
   Callback URL: https://your-app.vercel.app/api/webhook
   Verify Token: (همان چیزی که در META_WEBHOOK_VERIFY_TOKEN گذاشتی)
   ```
3. **Subscribe** کن به: `messages`, `comments`, `mentions`, `follows`

---

## ۳. تنظیم فایل .env.local

```env
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=min32charssecretkey_generatethis

DATABASE_URL=postgresql://...

META_APP_ID=1234567890
META_APP_SECRET=abc123def456...
META_WEBHOOK_VERIFY_TOKEN=my_random_secret_token_here

ANTHROPIC_API_KEY=sk-ant-...
```

**ساخت NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

---

## ۴. راه‌اندازی Database

### گزینه رایگان: Neon.tech
1. برو به https://neon.tech و ثبت‌نام کن
2. پروژه جدید بساز
3. Connection string را کپی کن و در DATABASE_URL بگذار
4. سپس:
```bash
npx prisma db push
```

---

## ۵. Deploy روی Vercel

```bash
npm install -g vercel
vercel --prod
```

یا از GitHub:
1. پروژه را push کن به GitHub
2. برو به https://vercel.com
3. **Import Project** → انتخاب repo
4. Environment Variables را اضافه کن
5. Deploy کن

---

## ۶. تست فاز ۱

بعد از Deploy:
1. برو به `https://your-app.vercel.app`
2. ثبت‌نام کن
3. روی «اتصال به اینستاگرام» کلیک کن
4. با فیسبوک وارد شو و مجوزها را تأیید کن
5. اگر به داشبورد برگشتی → **فاز ۱ موفق!**

### تست Webhook:
در Meta Developer Console:
- **Webhooks → Test** کلیک کن
- باید پاسخ `200 OK` برگرداند

