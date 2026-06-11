# طراحی OAuth Connection Flow برای InstaFlow

**تاریخ**: 11 ژوئن 2026  
**وضعیت**: طراحی - منتظر تأیید برای پیاده‌سازی  
**هدف**: اتصال یک‌کلیکه پیج اینستاگرام برای کاربر عادی (Non-Technical User)

---

## 🎯 اهداف

### تجربه کاربری:
- ✅ اتصال یک‌کلیکه بدون هیچ ورود دستی Token یا ID
- ✅ هیچ اصطلاح فنی در UI کاربر عادی
- ✅ پیام‌های فارسی واضح و ساده
- ✅ مدیریت خودکار خطاها

### امنیت:
- ✅ استفاده از OAuth 2.0 رسمی Meta
- ✅ ذخیره امن Token در دیتابیس رمزگذاری شده
- ✅ Long-Lived Token (60 روز) با قابلیت Refresh
- ✅ Scope محدود به دسترسی‌های ضروری

### مدهای مختلف:
- ✅ **User Mode**: اتصال یک‌کلیکه (OAuth)
- ✅ **Developer Mode**: اتصال دستی با Token (مخفی از کاربر عادی)

---

## 📋 Flow اتصال (User Mode - OAuth)

### مرحله 1: شروع اتصال
**صفحه**: `/dashboard/settings/connection`

**UI کاربر**:
```
┌─────────────────────────────────────┐
│  🔴 پیج متصل نیست                  │
│                                     │
│  برای استفاده از دایرکت هوشمند،   │
│  ابتدا پیج اینستاگرام خود را      │
│  وصل کنید.                         │
│                                     │
│  ┌───────────────────────────┐     │
│  │ 💬 اتصال به اینستاگرام   │     │
│  └───────────────────────────┘     │
└─────────────────────────────────────┘
```

**عملیات**:
```typescript
function handleConnect() {
  // 1. ساخت state برای امنیت (CSRF protection)
  const state = generateSecureRandomString();
  sessionStorage.setItem('oauth_state', state);
  
  // 2. ساخت URL OAuth Meta
  const authUrl = buildMetaOAuthUrl({
    app_id: META_APP_ID,
    redirect_uri: `${BASE_URL}/api/auth/instagram/callback`,
    scope: 'instagram_basic,instagram_manage_messages,instagram_manage_comments,pages_show_list,pages_read_engagement',
    state: state,
    response_type: 'code',
  });
  
  // 3. Redirect به Meta
  window.location.href = authUrl;
}
```

---

### مرحله 2: ورود کاربر به Meta
**صفحه**: Meta OAuth (خارج از InstaFlow)

**تجربه کاربر**:
1. ورود به Facebook (اگر قبلاً login نبوده)
2. انتخاب صفحه Facebook متصل به Instagram Business
3. انتخاب پیج Instagram
4. بررسی دسترسی‌های درخواستی:
   - اطلاعات پایه پیج
   - خواندن و ارسال پیام‌های دایرکت
   - مدیریت کامنت‌ها
5. کلیک روی "تأیید" یا "Allow"

**دسترسی‌های مورد نیاز (Scopes)**:
- `instagram_basic`: اطلاعات پایه پروفایل
- `instagram_manage_messages`: خواندن و ارسال پیام دایرکت
- `pages_show_list`: لیست صفحات کاربر
- `pages_read_engagement`: خواندن تعاملات صفحه
- `instagram_manage_comments`: مدیریت کامنت‌ها

---

### مرحله 3: Callback و دریافت Code
**مسیر**: `/api/auth/instagram/callback`

**پارامترهای دریافتی**:
```typescript
{
  code: "AQD...",  // Authorization code
  state: "abc123"  // State برای امنیت
}
```

**عملیات Backend**:
```typescript
export async function GET(req: NextRequest) {
  // 1. بررسی state برای جلوگیری از CSRF
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  
  if (!code || !state) {
    return redirect('/dashboard/settings/connection?error=missing_params');
  }
  
  // 2. تبدیل code به Access Token
  const tokenResponse = await fetch('https://graph.facebook.com/v21.0/oauth/access_token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: META_APP_ID,
      client_secret: META_APP_SECRET,
      code: code,
      redirect_uri: REDIRECT_URI,
    }),
  });
  
  const { access_token } = await tokenResponse.json();
  
  // 3. دریافت اطلاعات کاربر و صفحات
  const pagesResponse = await fetch(
    `https://graph.facebook.com/v21.0/me/accounts?access_token=${access_token}`
  );
  const { data: pages } = await pagesResponse.json();
  
  // 4. ذخیره موقت برای انتخاب پیج
  await saveTemporaryOAuthData(session.userId, {
    access_token,
    pages,
    expires_at: Date.now() + 300000, // 5 دقیقه
  });
  
  // 5. Redirect به صفحه انتخاب پیج
  return redirect('/dashboard/settings/connection/select-page');
}
```

---

### مرحله 4: انتخاب پیج Instagram
**صفحه**: `/dashboard/settings/connection/select-page`

**UI کاربر**:
```
┌─────────────────────────────────────┐
│  پیج اینستاگرام خود را انتخاب کنید │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📷 @shanshin.rest           │   │
│  │ رستوران شانشین              │   │
│  │         [انتخاب این پیج] ✓ │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📷 @mybusiness              │   │
│  │ My Business Page            │   │
│  │         [انتخاب این پیج]   │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**عملیات**:
```typescript
async function selectPage(pageId: string) {
  // 1. دریافت Page Access Token
  const pageToken = await getPageAccessToken(pageId);
  
  // 2. دریافت Instagram Business Account
  const igAccountResponse = await fetch(
    `https://graph.facebook.com/v21.0/${pageId}?fields=instagram_business_account&access_token=${pageToken}`
  );
  const { instagram_business_account } = await igAccountResponse.json();
  
  if (!instagram_business_account) {
    throw new Error('این صفحه به حساب Instagram Business متصل نیست.');
  }
  
  // 3. دریافت اطلاعات Instagram
  const igProfile = await fetch(
    `https://graph.facebook.com/v21.0/${instagram_business_account.id}?fields=username,name,profile_picture_url&access_token=${pageToken}`
  );
  const profile = await igProfile.json();
  
  // 4. تبدیل به Long-Lived Token (60 روز)
  const longLivedToken = await exchangeForLongLivedToken(pageToken);
  
  // 5. ذخیره در دیتابیس
  await saveInstagramConnection({
    workspaceId: session.workspaceId,
    instagramId: instagram_business_account.id,
    username: profile.username,
    name: profile.name,
    pageId: pageId,
    accessToken: encrypt(longLivedToken), // رمزگذاری
    mode: 'page_token',
  });
  
  // 6. Redirect به صفحه موفقیت
  return redirect('/dashboard/settings/connection?success=true');
}
```

---

### مرحله 5: تأیید اتصال موفق
**صفحه**: `/dashboard/settings/connection?success=true`

**UI کاربر**:
```
┌─────────────────────────────────────┐
│  ✅ پیج شما متصل است                │
│                                     │
│  @shanshin.rest                     │
│  ✓ دسترسی پیام‌ها فعال است          │
│                                     │
│  ┌─────────────┐ ┌───────────────┐ │
│  │ مشاهده      │ │ دایرکت       │ │
│  │ اینباکس     │ │ هوشمند       │ │
│  └─────────────┘ └───────────────┘ │
└─────────────────────────────────────┘
```

---

## 🔧 مسیرهای API لازم

### 1. شروع OAuth
**مسیر**: `GET /api/auth/instagram/start`

**پارامترها**: -

**خروجی**:
```json
{
  "authUrl": "https://www.facebook.com/v21.0/dialog/oauth?..."
}
```

---

### 2. Callback OAuth
**مسیر**: `GET /api/auth/instagram/callback`

**پارامترها**: 
- `code`: Authorization code
- `state`: CSRF token

**خروجی**: Redirect به `/dashboard/settings/connection/select-page`

---

### 3. لیست صفحات
**مسیر**: `GET /api/auth/instagram/pages`

**پارامترها**: -

**خروجی**:
```json
{
  "pages": [
    {
      "id": "123456",
      "name": "رستوران شانشین",
      "instagram_business_account": {
        "id": "17841453193519327",
        "username": "shanshin.rest"
      }
    }
  ]
}
```

---

### 4. اتصال نهایی
**مسیر**: `POST /api/auth/instagram/connect`

**Body**:
```json
{
  "pageId": "123456"
}
```

**خروجی**:
```json
{
  "ok": true,
  "account": {
    "instagramId": "17841453193519327",
    "username": "shanshin.rest",
    "name": "رستوران شانشین"
  }
}
```

---

### 5. قطع اتصال
**مسیر**: `DELETE /api/auth/instagram/disconnect`

**پارامترها**: -

**خروجی**:
```json
{
  "ok": true,
  "message": "اتصال با موفقیت قطع شد."
}
```

---

### 6. Refresh Token
**مسیر**: `POST /api/auth/instagram/refresh`

**پارامترها**: -

**خروجی**:
```json
{
  "ok": true,
  "expiresIn": 5184000
}
```

---

## 🚨 مدیریت خطاها

### خطاهای رایج و پیام‌های فارسی

| خطا | پیام فارسی | راه‌حل |
|-----|-----------|--------|
| `missing_permissions` | دسترسی‌های لازم تأیید نشد | کاربر باید دوباره اتصال کند و همه دسترسی‌ها را تأیید کند |
| `page_not_connected` | این صفحه به Instagram Business متصل نیست | راهنمایی برای تبدیل به Business Account |
| `token_expired` | اتصال منقضی شده است | نمایش دکمه "اتصال مجدد" |
| `invalid_state` | خطای امنیتی در اتصال | شروع مجدد فرآیند اتصال |
| `user_cancelled` | شما اتصال را لغو کردید | نمایش دکمه "تلاش مجدد" |
| `app_not_approved` | برنامه هنوز تأیید نشده است | نمایش پیام "در حال بررسی Meta" |

---

## 🔐 امنیت

### 1. CSRF Protection
```typescript
// تولید state تصادفی
const state = crypto.randomBytes(32).toString('hex');
sessionStorage.setItem('oauth_state', state);

// بررسی state در callback
if (receivedState !== savedState) {
  throw new Error('Invalid state - potential CSRF attack');
}
```

### 2. رمزگذاری Token
```typescript
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY; // 32 bytes
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = Buffer.from(parts[1], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}
```

### 3. Token Refresh خودکار
```typescript
// Cron job روزانه
async function refreshExpiringSoonTokens() {
  const accounts = await prisma.instagramAccount.findMany({
    where: {
      tokenExpiresAt: {
        lt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // کمتر از 7 روز
      },
    },
  });

  for (const account of accounts) {
    try {
      const newToken = await refreshAccessToken(decrypt(account.accessToken));
      await prisma.instagramAccount.update({
        where: { id: account.id },
        data: {
          accessToken: encrypt(newToken.access_token),
          tokenExpiresAt: new Date(Date.now() + newToken.expires_in * 1000),
        },
      });
    } catch (error) {
      // اطلاع‌رسانی به کاربر برای اتصال مجدد
      await notifyUserToReconnect(account.workspaceId);
    }
  }
}
```

---

## 🛠️ Developer Mode (مخفی از کاربر عادی)

### دسترسی:
- فقط برای Admin یا Developer
- مسیر مخفی: `/dashboard/settings/connection/dev`
- نیاز به permission خاص در دیتابیس

### امکانات:
- وارد کردن دستی Token
- مشاهده اطلاعات فنی (Token Preview، Instagram ID، Page ID)
- تست API با cURL
- لاگ‌های اتصال
- Debug Mode

---

## 📊 Schema تغییرات دیتابیس

### جدول InstagramAccount:
```prisma
model InstagramAccount {
  id                String   @id @default(cuid())
  workspaceId       String
  instagramId       String
  username          String?
  name              String?
  pageId            String?
  accessToken       String   // Encrypted
  tokenExpiresAt    DateTime?
  refreshToken      String?  // Encrypted (اگر مورد نیاز باشد)
  mode              String   @default("page_token") // "page_token" | "instagram_login"
  webhookStatus     String   @default("pending")
  isActive          Boolean  @default(true)
  connectedAt       DateTime @default(now())
  lastRefreshedAt   DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  workspace         Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@unique([workspaceId, instagramId])
  @@index([workspaceId, isActive])
}
```

---

## 🧪 تست Flow

### Checklist پیش از Production:

- [ ] تست OAuth با Test User
- [ ] تست با صفحه‌های مختلف (Business/Personal)
- [ ] تست با صفحه بدون Instagram متصل
- [ ] تست لغو اتصال توسط کاربر
- [ ] تست Token Expired
- [ ] تست CSRF Protection
- [ ] تست رمزگذاری/رمزگشایی Token
- [ ] تست Refresh Token
- [ ] تست قطع اتصال
- [ ] تست Developer Mode
- [ ] تست پیام‌های خطا به فارسی

---

## 📱 تجربه کاربری موبایل

### در صفحه `/dashboard/settings/connection`:
```
┌─────────────────────────────────────┐
│         [←]  Instagram              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │     🔴 پیج متصل نیست        │   │
│  │                             │   │
│  │  برای استفاده از دایرکت    │   │
│  │  هوشمند، پیج خود را وصل    │   │
│  │  کنید.                      │   │
│  │                             │   │
│  │  ┌─────────────────────┐   │   │
│  │  │ 💬 اتصال به         │   │   │
│  │  │    اینستاگرام       │   │   │
│  │  └─────────────────────┘   │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  چگونه کار می‌کند؟                 │
│  ۱. دکمه اتصال را بزنید            │
│  ۲. با حساب فیسبوک وارد شوید      │
│  ۳. پیج را انتخاب کنید             │
│  ۴. دسترسی‌ها را تأیید کنید        │
│  ۵. تمام!                          │
│                                     │
│  🔒 اتصال امن و رسمی               │
│  InstaFlow از طریق پروتکل رسمی    │
│  Meta متصل می‌شود.                 │
└─────────────────────────────────────┘
```

---

## ✅ مراحل بعدی

### قبل از شروع کدنویسی:
1. ✅ UI ساده‌سازی شد (انجام شد)
2. ⏳ تأیید طراحی توسط شما
3. ⏳ ساخت Meta App و دریافت App ID/Secret
4. ⏳ تنظیم Redirect URI در Meta App Dashboard
5. ⏳ اضافه کردن متغیرهای محیطی:
   ```env
   META_APP_ID="your_app_id"
   META_APP_SECRET="your_app_secret"
   META_REDIRECT_URI="https://yourdomain.com/api/auth/instagram/callback"
   TOKEN_ENCRYPTION_KEY="32_byte_random_hex_key"
   ```

### بعد از تأیید:
1. پیاده‌سازی `/api/auth/instagram/start`
2. پیاده‌سازی `/api/auth/instagram/callback`
3. پیاده‌سازی صفحه انتخاب پیج
4. پیاده‌سازی `/api/auth/instagram/connect`
5. تست کامل Flow
6. راه‌اندازی Token Refresh Job
7. پیاده‌سازی Developer Mode (اختیاری)

---

**منتظر تأیید شما برای شروع پیاده‌سازی هستم.** 🚀
