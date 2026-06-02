export default function DataDeletionPage() {
  return (
    <main dir="rtl" className="mx-auto max-w-[720px] px-5 py-8 text-right leading-8 text-[#17112A]">
      <h1 className="text-2xl font-black">Data Deletion Request</h1>
      <p className="mt-4">برای حذف داده‌های مربوط به پیام‌ها یا لیدهای ثبت‌شده در Instaflow Shanshin، درخواست حذف را به مدیر رسمی شانشین ارسال کنید.</p>
      <h2 className="mt-6 text-lg font-black">اطلاعات لازم برای درخواست حذف</h2>
      <ul className="mt-2 list-disc pr-6">
        <li>نام کاربری اینستاگرام</li>
        <li>شماره تماس در صورت ثبت در لید</li>
        <li>توضیح کوتاه درخواست حذف</li>
      </ul>
      <h2 className="mt-6 text-lg font-black">روند حذف</h2>
      <p>پس از تأیید مالکیت درخواست، داده‌های مرتبط با لید و پیام‌های ذخیره‌شده در پنل داخلی حذف یا ناشناس‌سازی می‌شود.</p>
    </main>
  );
}
