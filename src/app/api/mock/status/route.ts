import { NextResponse } from "next/server";
import { getMockSettings, MOCK_CONVERSATIONS } from "@/lib/mock-instagram-data";

export async function GET() {
  const settings = getMockSettings();
  
  // استخراج کلمات کلیدی از پیام‌ها
  const sampleKeywords: string[] = [];
  for (const conv of MOCK_CONVERSATIONS) {
    for (const msg of conv.messages || []) {
      const text = msg.message || "";
      if (text.includes("منو")) sampleKeywords.push("منو");
      if (text.includes("رزرو")) sampleKeywords.push("رزرو");
      if (text.includes("آدرس")) sampleKeywords.push("آدرس");
      if (text.includes("ساعت کاری")) sampleKeywords.push("ساعت کاری");
      if (text.includes("قیمت")) sampleKeywords.push("قیمت");
    }
  }

  return NextResponse.json({
    ok: true,
    mockMode: settings.enabled,
    conversationsCount: settings.conversationCount,
    messageCount: settings.messageCount,
    sampleKeywords: Array.from(new Set(sampleKeywords)),
    profile: {
      username: settings.profile.username,
      name: settings.profile.name,
    },
  });
}
