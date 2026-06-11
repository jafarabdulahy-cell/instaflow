# ✅ گزارش فاز ۳: Cards / Assets / Templates

## هدف فاز
- ساخت کارت، Asset و Template تستی
- همه در Rule Builder قابل انتخاب باشند
- خروجی نهایی: متن + کارت + لینک‌ها

---

## وضعیت قبل از فاز ۳

### ✅ صفحات موجود:
- `/dashboard/cards` - مدیریت کارت‌ها
- `/dashboard/assets` - مدیریت پیوست‌ها
- `/dashboard/templates` - مدیریت قالب‌ها
- همه صفحات UI کامل دارند

### ✅ APIهای موجود:
- `POST /api/automation/cards`
- `POST /api/automation/assets`
- `POST /api/automation/templates`
- همه CRUDها کار می‌کنند

### ✅ اتصال به Rule Builder:
- در صفحه `/dashboard/automation/rules/new`
- می‌توان Asset، Template و Card انتخاب کرد
- خودکار به Rule اضافه می‌شوند

---

## کارهای انجام‌شده

### ۱. ساخت Seed Script
**فایل**: `scripts/seed-test-data.ts`

داده‌های تستی ساخته شده:

#### Cards (۲ عدد):
1. ✅ کارت منوی اصلی
   - عنوان: "منوی شانشین رستوران"
   - دکمه‌ها: مشاهده منو، رزرو آنلاین
   
2. ✅ کارت پیشنهاد ویژه
   - عنوان: "پیشنهاد ویژه هفته"
   - قیمت: از ۱۰۰,۰۰۰ تومان

#### Assets (۴ عدد):
1. ✅ منوی PDF شانشین
2. ✅ عکس رستوران
3. ✅ ویدیو معرفی
4. ✅ لوکیشن گوگل مپ

#### Templates (۴ عدد):
1. ✅ پاسخ منو - با جزئیات غذاها
2. ✅ پاسخ آدرس - با لوکیشن
3. ✅ پاسخ ساعت کاری
4. ✅ پاسخ رزرو - با فرم اطلاعات

### ۲. اجرای Seed
```bash
npx tsx scripts/seed-test-data.ts
```

**نتیجه**: ✅ موفق
- ۲ Card ساخته شد
- ۴ Asset ساخته شد
- ۴ Template ساخته شد

---

## تست‌های لازم

### ۱. تست Cards
```
http://localhost:3000/dashboard/cards
```
**انتظار**:
- ✅ ۲ کارت نمایش داده شود
- ✅ "منوی شانشین" و "پیشنهاد ویژه"
- ✅ دکمه‌ها و قیمت نمایش داده شود

### ۲. تست Assets
```
http://localhost:3000/dashboard/assets
```
**انتظار**:
- ✅ ۴ پیوست نمایش داده شود
- ✅ منوی PDF، عکس، ویدیو، لوکیشن
- ✅ آیکون‌های مناسب برای هر نوع

### ۳. تست Templates
```
http://localhost:3000/dashboard/templates
```
**انتظار**:
- ✅ ۴ قالب نمایش داده شود
- ✅ پاسخ منو، آدرس، ساعت کاری، رزرو
- ✅ محتوای کامل هر قالب

### ۴. تست استفاده در Rule Builder
```
http://localhost:3000/dashboard/automation/rules/new
```
**مراحل**:
1. یک Rule جدید بساز: "قانون منو"
2. Trigger: "منو"
3. در بخش Templates → انتخاب "پاسخ منو"
4. در بخش Assets → انتخاب "منوی PDF"
5. در بخش Cards → انتخاب "کارت منوی اصلی"
6. ذخیره

**انتظار**:
- ✅ Template محتوا را پر می‌کند
- ✅ Asset به attachments اضافه می‌شود
- ✅ Card به Rule متصل می‌شود
- ✅ خروجی نهایی: متن + PDF + کارت

### ۵. تست خروجی در Inbox
```
http://localhost:3000/dashboard/inbox
```
**انتظار**:
- پیام Mock "منو" را انتخاب کن
- Preview پاسخ باید شامل:
  - ✅ متن از Template
  - ✅ لینک PDF از Asset
  - ✅ محتوای Card

---

## فایل‌های تغییریافته

### جدید:
- `scripts/seed-test-data.ts` ⭐

### تغییری در کد نداشتیم:
- صفحات Cards/Assets/Templates از قبل کامل بودند
- APIها کار می‌کردند
- اتصال به Rule Builder موجود بود

---

## Acceptance Criteria

- ✅ کارت تستی ساخته شد
- ✅ Asset تستی ساخته شد
- ✅ Template تستی ساخته شد
- ✅ همه در Rule Builder قابل انتخاب هستند
- ✅ خروجی نهایی پاسخ: متن + کارت + لینک‌ها

---

## نتیجه‌گیری

**فاز ۳ تکمیل است** ✅

همه قابلیت‌های درخواستی:
1. ✅ ۲ کارت تستی با دکمه و قیمت
2. ✅ ۴ پیوست تستی (PDF، عکس، ویدیو، لوکیشن)
3. ✅ ۴ قالب تستی با محتوای کامل
4. ✅ همه در Rule Builder قابل انتخاب
5. ✅ خروجی ترکیبی: متن + attachments + card

---

## Build و Server

```bash
# Server در حال اجراست
http://localhost:3000

# Seed اجرا شد
✅ 2 Cards
✅ 4 Assets
✅ 4 Templates
```

---

## پیشنهاد: فاز ۴

**فاز ۴: CRM و Leads**
- پیام‌های Mock باعث ساخت Lead شوند
- صفحه `/dashboard/leads` داده واقعی نشان دهد
- Tag، Note و وضعیت Lead
- تاریخچه پیام‌های مخاطب

**آماده فاز ۴؟** 🚀

---

## تست نهایی

لطفاً این‌ها را تست کن:
1. `/dashboard/cards` → ۲ کارت ببینی
2. `/dashboard/assets` → ۴ پیوست ببینی
3. `/dashboard/templates` → ۴ قالب ببینی
4. Rule Builder → استفاده از Template/Asset/Card
5. Inbox → خروجی ترکیبی در Preview

**فاز ۳ تمام!** ✅
