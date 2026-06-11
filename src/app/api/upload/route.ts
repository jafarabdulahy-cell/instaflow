import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ ok: false, error: "فایلی انتخاب نشده است." }, { status: 400 });
    }

    // بررسی نوع فایل
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ ok: false, error: "فقط فایل‌های تصویری مجاز هستند." }, { status: 400 });
    }

    // بررسی حجم (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ ok: false, error: "حجم فایل نباید بیشتر از 5MB باشد." }, { status: 400 });
    }

    // تبدیل به Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ساخت نام فایل یکتا
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${randomUUID()}.${ext}`;
    
    // مسیر ذخیره
    const uploadDir = join(process.cwd(), "public", "uploads");
    const filepath = join(uploadDir, filename);

    // ایجاد پوشه اگر وجود ندارد
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // پوشه از قبل وجود دارد
    }

    // ذخیره فایل
    await writeFile(filepath, buffer);

    // URL عمومی
    const url = `/uploads/${filename}`;

    return NextResponse.json({
      ok: true,
      url,
      filename,
      size: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { ok: false, error: "خطا در آپلود فایل." },
      { status: 500 }
    );
  }
}
