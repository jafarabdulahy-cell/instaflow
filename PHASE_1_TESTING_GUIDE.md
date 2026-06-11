# Phase 1 Testing Guide

## Pre-Testing Setup

### 1. Start Development Server
```bash
npm run dev
```

### 2. Open Browser
Navigate to: `http://localhost:3000`

### 3. Open DevTools
- Press F12
- Go to **Network** tab
- Enable **Preserve log**
- Filter by **Fetch/XHR**

---

## Test Scenarios

### ✅ Test 1: Homepage Redesign

**Steps:**
1. Navigate to `/dashboard`
2. Verify you see:
   - ✓ Dashboard header with logo
   - ✓ Connection status bar (green or amber)
   - ✓ Purple hero banner with text "دایرکت و کامنت **پیجت** را هوشمند کن"
   - ✓ 4 main action cards in 2x2 grid:
     - دایرکت هوشمند
     - لیدها
     - تولید محتوا
     - تنظیمات
   - ✓ "کار بعدی شما" quick action card at bottom

**Expected:**
- All text should be right-aligned (RTL)
- No Meta API calls in Network tab (only `/api/me` allowed)
- Page width max 430px (mobile-first)
- All Persian text readable and properly aligned

**Screenshot:** Take screenshot for verification

---

### ✅ Test 2: Bottom Navigation

**Steps:**
1. From `/dashboard`, check bottom navigation bar
2. Verify exactly 5 items:
   - خانه (Home icon)
   - دایرکت (Message icon)
   - محتوا (Sparkles icon)
   - لیدها (Users icon)
   - تنظیمات (Link icon)

**Expected:**
- خانه should be highlighted (active state)
- No "قوانین" or "اینباکس" in main nav
- All icons clearly visible
- Persian labels displayed correctly

---

### ✅ Test 3: Direct Aggregator Page

**Steps:**
1. Click "دایرکت" in bottom nav OR
2. Click "دایرکت هوشمند" card on homepage
3. Verify you land on `/dashboard/direct`
4. Check page contains:
   - ✓ Header with back button and "دایرکت هوشمند" title
   - ✓ Description card
   - ✓ 5 module cards with gradient backgrounds:
     1. اینباکس (MessageCircle icon)
     2. قوانین هوشمند (Bot icon)
     3. ویترین (Grid icon)
     4. پاسخ‌های سریع (Zap icon)
     5. رسانه‌ها (Image icon)

**Expected:**
- All cards clickable
- Each card has colored gradient background
- RTL layout
- Back button returns to `/dashboard`

**Test links:**
- Click "اینباکس" → should go to `/dashboard/inbox`
- Click "قوانین هوشمند" → should go to `/dashboard/automation/rules`
- Click "ویترین" → should go to `/dashboard/cards`
- Click "پاسخ‌های سریع" → should go to `/dashboard/templates`
- Click "رسانه‌ها" → should go to `/dashboard/assets`

---

### ✅ Test 4: Content Placeholder Page

**Steps:**
1. Click "محتوا" in bottom nav OR
2. Click "تولید محتوا" card on homepage
3. Verify you land on `/dashboard/content`
4. Check page shows:
   - ✓ Header with "تولید محتوا" title
   - ✓ Purple gradient hero with Sparkles icon
   - ✓ Main message: "ماژول تولید محتوا در فاز بعدی ساخته می‌شود..."
   - ✓ 5 upcoming features listed:
     - تولید ایده
     - تولید کپشن
     - تقویم محتوا
     - طراحی استوری
     - زمان‌بندی انتشار

**Expected:**
- NO content generator form
- NO API calls
- Clear placeholder message
- RTL layout
- Back button works

---

### ✅ Test 5: Settings Main Page

**Steps:**
1. Click "تنظیمات" in bottom nav OR
2. Click "تنظیمات" card on homepage
3. Verify you land on `/dashboard/settings`
4. Check page contains:
   - ✓ Header with "تنظیمات" title
   - ✓ 3 section cards:
     1. اتصال پیج اینستاگرام (Link2 icon)
     2. حساب کاربری (User icon)
     3. مدیریت پیج (Settings icon)
   - ✓ Info card at bottom

**Expected:**
- All 3 cards clickable
- Gradient backgrounds
- RTL layout
- Back button works

---

### ✅ Test 6: Connection Settings Page

**Steps:**
1. From settings page, click "اتصال پیج اینستاگرام"
2. Verify you land on `/dashboard/settings/connection`
3. Check page contains:
   - ✓ Purple gradient header
   - ✓ Connection status cards (if already connected)
   - ✓ Form with:
     - Instagram ID input (LTR)
     - Access Token textarea (LTR)
     - "ذخیره اتصال" button
   - ✓ Info card with 3 bullet points
   - ✓ Success card if already connected with links to inbox/direct

**Expected:**
- Form functional (can type)
- NO Token/Page ID/Webhook displayed in plain text
- If token saved, shows preview like "EAA...xyz"
- RTL layout for Persian text
- LTR for token input
- Back button goes to `/dashboard/settings`

**Test submission:**
- Try submitting with empty fields → should show error
- (Optional) Try with valid credentials → should save

---

### ✅ Test 7: Account Settings Placeholder

**Steps:**
1. From settings page, click "حساب کاربری"
2. Verify you land on `/dashboard/settings/account`
3. Check page shows:
   - ✓ Header with "حساب کاربری" title
   - ✓ Placeholder card with User icon
   - ✓ Message: "این بخش در فاز بعدی پیاده‌سازی می‌شود..."

**Expected:**
- Simple placeholder
- Clear future features message
- RTL layout

---

### ✅ Test 8: Page Info Placeholder

**Steps:**
1. From settings page, click "مدیریت پیج"
2. Verify you land on `/dashboard/settings/page-info`
3. Check page shows:
   - ✓ Header with "مدیریت پیج" title
   - ✓ Placeholder card with Settings icon
   - ✓ Message: "این بخش در فاز بعدی پیاده‌سازی می‌شود..."

**Expected:**
- Simple placeholder
- Clear future features message
- RTL layout

---

### ✅ Test 9: Connect Redirect

**Steps:**
1. Manually navigate to `/connect` in browser address bar
2. Press Enter

**Expected:**
- Immediately redirects to `/dashboard/settings/connection`
- NO delay (server-side redirect)
- NO flash of old page
- Address bar shows new URL

---

### ✅ Test 10: Existing Pages Still Work

**Test these existing routes are unchanged:**

1. `/dashboard/inbox` → Inbox page loads normally
2. `/dashboard/leads` → Leads page loads normally
3. `/dashboard/automation/rules` → Rules page loads normally
4. `/dashboard/cards` → Cards page loads normally
5. `/dashboard/templates` → Templates page loads normally
6. `/dashboard/assets` → Assets page loads normally

**Expected:**
- All pages load without errors
- All functionality preserved
- Bottom navigation shows correct active state

---

### ✅ Test 11: RTL Verification

**Check these elements for proper right-alignment:**

1. All page titles
2. All card text
3. All descriptions
4. All placeholder messages
5. All button text
6. Form labels (not inputs)

**Expected:**
- Persian text flows right-to-left
- Text starts from right edge
- Icons positioned correctly relative to text
- No text overflow or cut-off

---

### ✅ Test 12: Mobile Responsiveness

**Steps:**
1. Open DevTools
2. Toggle device toolbar (Ctrl+Shift+M)
3. Set device to:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - Pixel 5 (393px)

**Test at each size:**
- Homepage renders correctly
- Cards don't overflow
- Text readable
- Buttons reachable
- Navigation accessible

**Expected:**
- Content constrained to max-width 430px
- No horizontal scroll
- All elements accessible
- Text doesn't wrap awkwardly

---

### ✅ Test 13: No Meta API Calls

**Critical Security Test**

**Steps:**
1. Clear Network tab in DevTools
2. Navigate to `/dashboard`
3. Wait 5 seconds
4. Check Network tab

**Expected API calls:**
- ✅ `/api/me` - ALLOWED (local user info)

**NOT expected (should NOT appear):**
- ❌ `/api/dashboard` - if it calls Meta
- ❌ `/api/instagram/diagnostics`
- ❌ `/api/instagram/sync`
- ❌ Any `graph.facebook.com` requests
- ❌ Any `instagram.com` requests

**If you see Meta API calls:**
- ⚠️ STOP - Phase 1 requirement violated
- Report which endpoint triggered it

---

### ✅ Test 14: Navigation Flow

**Complete user journey:**

1. Start at `/dashboard`
2. Click "دایرکت هوشمند" → lands on `/dashboard/direct`
3. Click "اینباکس" → lands on `/dashboard/inbox`
4. Click "خانه" in bottom nav → back to `/dashboard`
5. Click "محتوا" in bottom nav → placeholder page
6. Click back button → back to `/dashboard`
7. Click "تنظیمات" in bottom nav → settings page
8. Click "اتصال پیج" → connection page
9. Click back button → settings page
10. Click back button → `/dashboard`

**Expected:**
- All navigation smooth
- No 404 errors
- No broken links
- Back buttons work correctly
- Active states update properly in bottom nav

---

## Performance Checks

### Load Time
- Homepage should load in < 2 seconds
- Subsequent pages < 1 second (client-side navigation)

### Network
- No unnecessary API calls
- No large image downloads
- No external CDN requests (all local)

### Console
- No JavaScript errors
- No React warnings
- No hydration errors

---

## Browser Compatibility

Test in:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (if available)

---

## Issue Reporting Template

If you find issues, report using this format:

```
## Issue: [Brief Description]

**Page:** `/dashboard/[page-name]`
**Browser:** Chrome 120
**Device:** Desktop / Mobile (specify)

**Steps to Reproduce:**
1. Navigate to...
2. Click on...
3. Observe...

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Screenshot:**
[Attach if helpful]

**Network Tab:**
[Any unexpected API calls]

**Console Errors:**
[Copy any errors]
```

---

## Success Criteria

Phase 1 is successful if:

- ✅ All 14 test scenarios pass
- ✅ No Meta API calls on dashboard load
- ✅ All Persian text is RTL and right-aligned
- ✅ All 5 nav items work correctly
- ✅ All new pages render without errors
- ✅ All existing pages still work
- ✅ Mobile responsive (max-width 430px)
- ✅ `/connect` redirects properly
- ✅ No console errors
- ✅ Build completed successfully

---

## After Testing

### If All Tests Pass ✅
1. Document any observations
2. Take screenshots of key pages:
   - `/dashboard` (homepage)
   - `/dashboard/direct`
   - `/dashboard/content`
   - `/dashboard/settings`
   - `/dashboard/settings/connection`
3. Confirm ready for Phase 2 planning

### If Tests Fail ❌
1. Document specific failures using template above
2. Note which test scenario failed
3. Provide screenshots and console logs
4. Wait for fixes before proceeding

---

**Happy Testing! 🚀**
