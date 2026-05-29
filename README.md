# InstaFlow — Phase 1 Core

نسخه فعلی، هسته کم‌ریسک فاز ۱ است: Workspace، ورود/ثبت‌نام واقعی، اتصال اینستاگرام، Webhook، Inbox و Chat.

## راه‌اندازی

```bash
npm install
cp .env.example .env.local
npx prisma generate
npx prisma db push
npm run dev
```

آدرس محلی:

```bash
http://localhost:3000
```

## Environment Variables

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=یک_کلید_حداقل_۳۲_کاراکتری
DATABASE_URL=postgresql://...
META_APP_ID=...
META_APP_SECRET=...
META_WEBHOOK_VERIFY_TOKEN=...
```

برای تولید `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

## مسیرهای اصلی

- `/auth/register` ثبت‌نام واقعی و ساخت Workspace
- `/auth/login` ورود واقعی
- `/dashboard` داشبورد موبایل‌فرست
- `/connect` اتصال Instagram Business/Creator
- `/dashboard/inbox` لیست گفتگوها
- `/dashboard/inbox/[id]` صفحه چت
- `/api/webhook` Webhook متا

## نکته مهم

فاز ۱ عمداً شامل AI، Content Studio، Automation Builder، Analytics و Billing نیست. این بخش‌ها باید بعد از پایدار شدن Inbox Core اضافه شوند.
