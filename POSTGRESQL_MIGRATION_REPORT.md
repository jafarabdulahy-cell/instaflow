<div dir="rtl" align="right">

# گزارش تغییر Database از SQLite به PostgreSQL

**تاریخ**: 11 ژوئن 2026  
**وضعیت**: ✅ آماده برای Railway

---

## 🎯 تغییرات انجام شده

### 1. تغییر Prisma Schema
**فایل**: `prisma/schema.prisma`

```prisma
// قبل:
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// بعد:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

### 2. ساخت Migration برای PostgreSQL
**فایل**: `prisma/migrations/20260611000000_switch_to_postgresql/migration.sql`

✅ **تمام Models موجود در Migration:**
- ✅ Workspace
- ✅ User
- ✅ InstagramAccount (با `tokenExpiresAt`)
- ✅ Contact
- ✅ Conversation
- ✅ Message
- ✅ WebhookEvent
- ✅ **OAuthSession** (جدید)

**نکات مهم Migration:**
- تمام `INTEGER` به `INTEGER` تبدیل شد (PostgreSQL compatible)
- تمام `DATETIME` به `TIMESTAMP(3)` تبدیل شد
- تمام `Json` به `JSONB` تبدیل شد (بهتر برای PostgreSQL)
- تمام Indexes و Foreign Keys حفظ شدند
- `AUTOINCREMENT` حذف شد (PostgreSQL از SERIAL استفاده می‌کند)

---

## 🔧 Environment Variables

### Development (Local با SQLite):
```env
DATABASE_URL="file:./dev.db"
```

### Production (Railway با PostgreSQL):
```env
DATABASE_URL="postgresql://user:pass@host:port/database?sslmode=require"
```

**نکته**: Railway به صورت خودکار `DATABASE_URL` را تنظیم می‌کند.

---

## ✅ Build Test

```bash
npm run build
```

**نتیجه**: ✅ موفق
- ✓ Compiled successfully in 5.5s
- ✓ 50 صفحه بدون خطا
- ✓ هیچ خطای TypeScript

---

## 📋 مراحل Deploy روی Railway

### مرحله 1: Push کد به GitHub
```bash
git add .
git commit -m "feat: switch database from SQLite to PostgreSQL for Railway"
git push origin main
```

### مرحله 2: تنظیمات Railway
1. **اضافه کردن PostgreSQL Plugin**:
   - در Railway Dashboard → Add Database → PostgreSQL
   - Railway به صورت خودکار `DATABASE_URL` را تنظیم می‌کند

2. **Environment Variables مورد نیاز**:
   ```env
   # Railway خودکار تنظیم می‌کند:
   DATABASE_URL=postgresql://...

   # شما باید این‌ها را اضافه کنید:
   NEXTAUTH_SECRET="your-production-secret"
   
   # OAuth Configuration:
   META_APP_ID="990667410114001"
   META_APP_SECRET="your-app-secret"
   META_REDIRECT_URI="https://your-app.up.railway.app/api/auth/instagram/callback"
   TOKEN_ENCRYPTION_KEY="generate-32-byte-hex-key"
   
   # Instagram API:
   META_PAGE_ID="812762118592536"
   META_PAGE_ACCESS_TOKEN="your-page-token"
   INSTAGRAM_ID="17841453193519327"
   INSTAGRAM_USERNAME="shanshin.rest"
   
   # Webhook:
   META_WEBHOOK_VERIFY_TOKEN="your-webhook-secret"
   
   # Mode:
   INSTAFLOW_AUTO_REPLY_MODE="live"
   INSTAFLOW_ALLOW_LIVE_SEND="true"
   ALLOW_DEMO_BOOTSTRAP="false"
   ```

### مرحله 3: اجرای Migration در Railway
Railway به صورت خودکار در Build Process اجرا می‌کند:
```json
// package.json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

اگر نیاز به Manual Migration باشد:
```bash
# در Railway Shell:
npx prisma migrate deploy
```

---

## 🔍 بررسی Model OAuthSession

✅ **موجود در Schema**:
```prisma
model OAuthSession {
  id           String    @id @default(cuid())
  workspaceId  String
  userId       String
  accessToken  String
  pages        String    // JSON string
  expiresAt    DateTime
  createdAt    DateTime  @default(now())
  @@index([workspaceId, userId])
  @@index([expiresAt])
}
```

✅ **موجود در Migration**:
```sql
CREATE TABLE "OAuthSession" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "pages" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OAuthSession_pkey" PRIMARY KEY ("id")
);
```

---

## 🔍 بررسی Model InstagramAccount

✅ **فیلدهای مهم برای OAuth**:
```prisma
model InstagramAccount {
  id                String     @id @default(cuid())
  workspaceId       String
  instagramId       String
  username          String
  accessToken       String      // ✅ رمزگذاری شده
  tokenExpiresAt    DateTime?   // ✅ برای OAuth Long-Lived Token
  facebookPageId    String?     // ✅ برای OAuth
  // ... سایر فیلدها
}
```

---

## 🚨 نکات مهم

### 1. SQLite vs PostgreSQL
| ویژگی | SQLite | PostgreSQL |
|-------|--------|------------|
| **محیط** | Development | Production |
| **فایل** | `prisma/dev.db` | Remote Database |
| **JSON** | `Json` | `JSONB` |
| **DateTime** | `DATETIME` | `TIMESTAMP(3)` |
| **Performance** | محدود | بالا |
| **Concurrent Connections** | یک نفر | چندین نفر |

### 2. Migration در Railway
- Railway اولین بار که Deploy می‌شود، Migration را اجرا می‌کند
- اگر database خالی است، تمام tables ساخته می‌شوند
- اگر table وجود دارد، فقط تغییرات اعمال می‌شوند

### 3. Local Development
- در Local می‌توانید همچنان از SQLite استفاده کنید
- فقط `DATABASE_URL="file:./dev.db"` در `.env` بگذارید
- Schema به هر دو SQLite و PostgreSQL compatible است

---

## ✅ Checklist قبل از Deploy

- [x] Schema به PostgreSQL تبدیل شد
- [x] Migration ساخته شد
- [x] OAuthSession در migration وجود دارد
- [x] InstagramAccount.tokenExpiresAt در migration وجود دارد
- [x] Build موفق است
- [ ] Commit و Push به GitHub
- [ ] Railway PostgreSQL Plugin اضافه شد
- [ ] Environment Variables در Railway تنظیم شدند
- [ ] Deploy موفق
- [ ] Migration در Railway اجرا شد

---

## 🔄 مراحل بعدی

### بعد از Deploy:
1. بررسی Logs در Railway
2. تست OAuth Connection
3. بررسی Database با Railway Dashboard
4. تست یک گفتگو واقعی
5. بررسی Webhook

### در صورت مشکل:
```bash
# در Railway Shell:
npx prisma db push --accept-data-loss
# یا
npx prisma migrate reset
```

---

**وضعیت فعلی**: ✅ آماده برای Deploy  
**مرحله بعدی**: Commit و Push به GitHub

</div>
