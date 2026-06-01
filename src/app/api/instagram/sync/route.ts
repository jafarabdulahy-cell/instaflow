import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/auth";
import { captureAutoLead } from "@/lib/auto-lead";
import { clean, fetchConversations, fetchInstagramJson } from "@/lib/instagram-api";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    const text = clean(value);
    if (text) return text;
  }
  return "";
}

async function activeAccount(workspaceId: string) {
  return prisma.instagramAccount.findFirst({
    where: { workspaceId, isActive: true, NOT: { accessToken: "manual" } },
    orderBy: { connectedAt: "desc" },
  });
}

async function fetchMessages(conversationId: string, accessToken: string) {
  // بعضی نسخه‌های Graph پیام‌ها را از /messages می‌دهند و بعضی از fields=messages. هر دو مسیر تست می‌شود.
  const direct = await fetchInstagramJson<{ data?: Record<string, unknown>[]; error?: unknown }>(
    `${conversationId}/messages?fields=id,from,to,message,created_time&limit=25`,
    accessToken
  );

  if (direct.ok && Array.isArray(direct.data.data)) return direct.data.data;

  const nested = await fetchInstagramJson<{
    messages?: { data?: Record<string, unknown>[] };
    error?: unknown;
  }>(`${conversationId}?fields=messages{id,from,to,message,created_time}`, accessToken);

  if (!nested.ok) return [];
  const messages = asRecord(nested.data).messages;
  const messageData = asRecord(messages).data;
  return Array.isArray(messageData) ? messageData : [];
}

export async function POST(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const account = await activeAccount(session.workspaceId);
  if (!account?.instagramId || !account?.accessToken) {
    return NextResponse.json({ error: "ابتدا Instagram ID و Token را در صفحه اتصال ذخیره کنید." }, { status: 400 });
  }

  let imported = 0;
  let duplicates = 0;
  let checkedConversations = 0;
  let checkedMessages = 0;
  const debug: Array<Record<string, unknown>> = [];

  const conversations = await fetchConversations(
    { instagramId: account.instagramId, accessToken: account.accessToken },
    `${account.instagramId}/conversations?fields=id,participants,updated_time&limit=25`
  );

  const conversationList = Array.isArray(conversations.data) ? conversations.data : [];

  for (const conversation of conversationList.slice(0, 25)) {
    if (!conversation.id) continue;
    checkedConversations += 1;
    const messages = await fetchMessages(conversation.id, account.accessToken);
    checkedMessages += messages.length;

    for (const message of messages) {
      const from = asRecord(message.from);
      const fromId = firstString(from.id);
      const fromUsername = firstString(from.username);
      const fromName = firstString(from.name, fromUsername, fromId);
      const text = firstString(message.message, "پیام جدید");
      const externalId = firstString(message.id);

      // پیام‌های خروجی خود پیج نباید به عنوان لید جدید وارد شوند.
      if (!fromId || fromId === account.instagramId || fromUsername === account.username) continue;

      const result = await captureAutoLead({
        account,
        instagramUserId: fromId,
        username: fromUsername,
        displayName: fromName,
        text,
        source: "instagram_dm",
        externalId,
        rawPayload: { conversation, message },
      });

      if (result?.duplicated) duplicates += 1;
      else if (result) imported += 1;
    }

    if (messages.length) {
      debug.push({ conversationId: conversation.id, messages: messages.length });
    }
  }

  return NextResponse.json({
    ok: true,
    checkedConversations,
    checkedMessages,
    imported,
    duplicates,
    empty: conversationList.length === 0,
    message: conversationList.length === 0
      ? "اتصال برقرار است اما Meta فعلاً گفتگویی برنگرداند."
      : `${checkedConversations} گفتگو بررسی شد و ${imported} پیام جدید به لید تبدیل شد.`,
    debug,
  });
}
