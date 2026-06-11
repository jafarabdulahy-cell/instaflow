/**
 * اسکریپت seed برای ساخت داده‌های تستی:
 * - Cards
 * - Assets
 * - Templates
 * 
 * اجرا: npx ts-node scripts/seed-test-data.ts
 */

import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

// workspace پیش‌فرض - اولین workspace را انتخاب می‌کنیم
const DEFAULT_WORKSPACE_ID = "default";

async function seedCards() {
  console.log("📦 Seeding Cards...");
  
  const cards = [
    {
      name: "کارت منوی اصلی",
      title: "منوی شانشین رستوران",
      description: "برای مشاهده منوی کامل و رزرو میز از دکمه‌های زیر استفاده کنید.",
      imageUrl: "https://via.placeholder.com/400x300/5B2BE2/FFFFFF?text=Menu",
      price: "",
      buttons: JSON.stringify([
        { label: "مشاهده منوی کامل", url: "https://example.com/menu" },
        { label: "رزرو آنلاین", url: "https://example.com/reserve" },
      ]),
    },
    {
      name: "کارت پیشنهاد ویژه",
      title: "پیشنهاد ویژه هفته",
      description: "تخفیف ۲۰٪ برای سفارش بالای ۵۰۰ هزار تومان",
      imageUrl: "https://via.placeholder.com/400x300/FF2D80/FFFFFF?text=Special",
      price: "از ۱۰۰,۰۰۰ تومان",
      buttons: JSON.stringify([
        { label: "جزئیات بیشتر", url: "https://example.com/special" },
      ]),
    },
  ];

  for (const card of cards) {
    await prisma.$executeRawUnsafe(
      `INSERT OR IGNORE INTO instaflow_direct_cards (id, workspace_id, name, title, description, image_url, price, buttons, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      randomUUID(),
      DEFAULT_WORKSPACE_ID,
      card.name,
      card.title,
      card.description,
      card.imageUrl,
      card.price,
      card.buttons,
      1
    );
  }

  console.log("✅ Cards seeded!");
}

async function seedAssets() {
  console.log("📎 Seeding Assets...");
  
  const assets = [
    {
      name: "منوی PDF شانشین",
      assetType: "file",
      url: "https://example.com/files/menu.pdf",
      description: "فایل PDF منوی کامل رستوران",
    },
    {
      name: "عکس رستوران",
      assetType: "image",
      url: "https://via.placeholder.com/800x600/5B2BE2/FFFFFF?text=Restaurant",
      description: "تصویر اصلی رستوران شانشین",
    },
    {
      name: "ویدیو معرفی",
      assetType: "video",
      url: "https://example.com/videos/intro.mp4",
      description: "ویدیو معرفی محیط و غذاها",
    },
    {
      name: "لوکیشن گوگل مپ",
      assetType: "link",
      url: "https://maps.google.com/?q=Bukhan,Iran",
      description: "لینک موقعیت رستوران در گوگل مپ",
    },
  ];

  for (const asset of assets) {
    await prisma.$executeRawUnsafe(
      `INSERT OR IGNORE INTO instaflow_media_assets (id, workspace_id, name, asset_type, url, description) VALUES (?, ?, ?, ?, ?, ?)`,
      randomUUID(),
      DEFAULT_WORKSPACE_ID,
      asset.name,
      asset.assetType,
      asset.url,
      asset.description
    );
  }

  console.log("✅ Assets seeded!");
}

async function seedTemplates() {
  console.log("📝 Seeding Templates...");
  
  const templates = [
    {
      title: "پاسخ منو",
      category: "رستوران",
      body: "سلام 🌹 منوی کامل شانشین آماده است.\n\n🍽️ غذاهای اصلی: کباب، چلوکباب، جوجه کباب\n🥗 پیش غذا: سالاد، دوغ، ماست\n🍰 دسر: بستنی، فالوده\n\nبرای رزرو میز یا سفارش، پیام بدهید.",
      mediaType: "none",
      mediaUrl: "",
    },
    {
      title: "پاسخ آدرس",
      category: "اطلاعات",
      body: "سلام 🌹 آدرس رستوران شانشین:\n\n📍 بوکان، خیابان اصلی، سه‌راه سنگینی\n\nبرای راهنمایی دقیق‌تر یا لوکیشن روی نقشه، پیام بدهید.",
      mediaType: "link",
      mediaUrl: "https://maps.google.com/?q=Bukhan,Iran",
    },
    {
      title: "پاسخ ساعت کاری",
      category: "اطلاعات",
      body: "سلام 🌹 ساعت کاری شانشین:\n\n⏰ همه‌روزه از ساعت ۱۱ صبح تا ۱۲ شب\n\nبرای رزرو یا سوالات دیگر، پیام بدهید.",
      mediaType: "none",
      mediaUrl: "",
    },
    {
      title: "پاسخ رزرو",
      category: "رزرو",
      body: "سلام 🌹 خوش آمدید!\n\nبرای رزرو میز لطفاً اطلاعات زیر را بفرمایید:\n\n👥 تعداد نفرات\n🕐 ساعت حضور\n👤 نام شما\n📱 شماره تماس\n\nهمکاران ما سریعاً بررسی و تأیید می‌کنند.",
      mediaType: "none",
      mediaUrl: "",
    },
  ];

  for (const template of templates) {
    await prisma.$executeRawUnsafe(
      `INSERT OR IGNORE INTO instaflow_reply_templates (id, workspace_id, title, category, body, media_type, media_url) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      randomUUID(),
      DEFAULT_WORKSPACE_ID,
      template.title,
      template.category,
      template.body,
      template.mediaType,
      template.mediaUrl || null
    );
  }

  console.log("✅ Templates seeded!");
}

async function main() {
  try {
    console.log("🌱 Starting seed...\n");
    
    await seedCards();
    await seedAssets();
    await seedTemplates();
    
    console.log("\n🎉 Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
