import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    await prisma.webhookEvent.create({
      data: {
        workspaceId: account?.workspaceId,
        instagramAccountId: account?.id,
        eventType: detectEventType(entry),
        payload: toInputJson(entry),
        processed: false,
      },
    });

    const messaging = Array.isArray(entry.messaging)
      ? (entry.messaging as Record<string, unknown>[])
      : [];

    for (const event of messaging) {
      await handleNewDM(account, event);
    }
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

async function handleNewDM(
  account: Awaited<ReturnType<typeof prisma.instagramAccount.findFirst>>,
  event: Record<string, unknown>
) {
  if (!account) return;

  const sender = event.sender as { id?: string } | undefined;
  const message = event.message as
    | { text?: string; mid?: string; attachments?: unknown[] }
    | undefined;

  const instagramUserId = sender?.id;
  const text = message?.text || "پیام جدید";

  if (!instagramUserId) return;

  const contact = await prisma.contact.upsert({
    where: {
      instagramAccountId_instagramUserId: {
        instagramAccountId: account.id,
        instagramUserId,
      },
    },
    create: {
      workspaceId: account.workspaceId,
      instagramAccountId: account.id,
      instagramUserId,
      username: instagramUserId,
      name: instagramUserId,
      lastContactAt: new Date(),
    },
    update: {
      lastContactAt: new Date(),
    },
  });

  const conversation = await prisma.conversation.upsert({
    where: {
      instagramAccountId_instagramUserId: {
        instagramAccountId: account.id,
        instagramUserId,
      },
    },
    create: {
      workspaceId: account.workspaceId,
      instagramAccountId: account.id,
      contactId: contact.id,
      instagramUserId,
      username: contact.username,
      displayName: contact.name || contact.username || instagramUserId,
      lastMessage: text,
      unreadCount: 1,
    },
    update: {
      lastMessage: text,
      unreadCount: { increment: 1 },
      updatedAt: new Date(),
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      externalId: message?.mid,
      direction: "inbound",
      senderId: instagramUserId,
      text,
      rawPayload: toInputJson(event),
    },
  });
}
