import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { captureAutoLead, type AutoLeadSource } from "@/lib/auto-lead";

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || "";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    await processWebhookEvent(body);
    return new NextResponse("EVENT_RECEIVED", { status: 200 });
  } catch (error) {
    console.error("webhook error", error);
    // برای اینکه Meta دوباره پشت سرهم webhook را retry نکند، همیشه 200 برمی‌گردانیم.
    return new NextResponse("EVENT_RECEIVED", { status: 200 });
  }
}

async function processWebhookEvent(body: Record<string, unknown>) {
  const entries = Array.isArray(body.entry)
    ? (body.entry as Record<string, unknown>[])
    : [];

  for (const entry of entries) {
    const pageId = String(entry.id || "");

    const account = await prisma.instagramAccount.findFirst({
      where: {
        OR: [{ facebookPageId: pageId }, { instagramId: pageId }],
      },
    });

    const webhookEvent = await prisma.webhookEvent.create({
      data: {
        workspaceId: account?.workspaceId,
        instagramAccountId: account?.id,
        eventType: detectEventType(entry),
        payload: toInputJson(entry),
        processed: false,
      },
    });

    if (!account) continue;

    let processedCount = 0;

    const messaging = Array.isArray(entry.messaging)
      ? (entry.messaging as Record<string, unknown>[])
      : [];

    for (const event of messaging) {
      const result = await handleNewDM(account, event);
      if (result) processedCount += 1;
    }

    const changes = Array.isArray(entry.changes)
      ? (entry.changes as Record<string, unknown>[])
      : [];

    for (const change of changes) {
      const result = await handleChangeInteraction(account, change);
      if (result) processedCount += 1;
    }

    await prisma.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: {
        processed: processedCount > 0,
        processedAt: processedCount > 0 ? new Date() : null,
      },
    });
  }
}

function detectEventType(entry: Record<string, unknown>) {
  if (Array.isArray(entry.messaging)) return "message";
  if (Array.isArray(entry.changes)) return "change";
  return "unknown";
}

function toInputJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function clean(value: unknown) {
  return String(value || "").trim();
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    const text = clean(value);
    if (text) return text;
  }
  return "";
}

function isStoryReply(event: Record<string, unknown>) {
  const message = asRecord(event.message);
  const referral = asRecord(event.referral);
  const replyTo = asRecord(message.reply_to);
  return Boolean(referral.story || replyTo.story || message.is_echo === false && clean(referral.source) === "STORY");
}

async function handleNewDM(
  account: NonNullable<Awaited<ReturnType<typeof prisma.instagramAccount.findFirst>>>,
  event: Record<string, unknown>
) {
  const sender = asRecord(event.sender);
  const message = asRecord(event.message);
  const instagramUserId = firstString(sender.id);
  if (!instagramUserId) return null;

  // پیام‌های echo از سمت خود پیج نباید لید جدید بسازند.
  if (message.is_echo === true) return null;

  const attachments = Array.isArray(message.attachments) ? message.attachments : [];
  const text = firstString(
    message.text,
    attachments.length ? "پیام رسانه‌ای جدید" : "",
    "پیام جدید"
  );

  const source: AutoLeadSource = isStoryReply(event) ? "instagram_story_reply" : "instagram_dm";

  return captureAutoLead({
    account,
    instagramUserId,
    username: firstString(sender.username),
    displayName: firstString(sender.name, sender.username, sender.id),
    text,
    source,
    externalId: firstString(message.mid, message.id),
    rawPayload: event,
  });
}

async function handleChangeInteraction(
  account: NonNullable<Awaited<ReturnType<typeof prisma.instagramAccount.findFirst>>>,
  change: Record<string, unknown>
) {
  const field = clean(change.field);
  const value = asRecord(change.value);
  const from = asRecord(value.from);

  const instagramUserId = firstString(from.id, value.from_id, value.user_id, value.sender_id, value.id);
  if (!instagramUserId) return null;

  const source: AutoLeadSource = field.includes("comment") || value.comment_id || value.media_id
    ? "instagram_comment"
    : "instagram_interaction";

  const rawText = firstString(value.text, value.message, value.caption, value.comment, "تعامل جدید اینستاگرام");
  const text = source === "instagram_comment" ? `کامنت: ${rawText}` : rawText;

  return captureAutoLead({
    account,
    instagramUserId,
    username: firstString(from.username, value.username),
    displayName: firstString(from.name, from.username, value.username, value.from_name, instagramUserId),
    text,
    source,
    externalId: firstString(value.comment_id, value.id, value.media_id),
    rawPayload: change,
  });
}
