import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { captureAutoLead } from "@/lib/auto-lead";

const BRIDGE_SECRET = process.env.INSTAFLOW_BRIDGE_SECRET || process.env.MANYCHAT_BRIDGE_SECRET || process.env.META_WEBHOOK_VERIFY_TOKEN || "";
const ENV_INSTAGRAM_ID = process.env.INSTAGRAM_ID || "";
const ENV_INSTAGRAM_USERNAME = process.env.INSTAGRAM_USERNAME || "shanshin.rest";

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

function normalizeUsername(value: string) {
  return clean(value).replace(/^@+/, "");
}

function mask(value: string) {
  if (!value) return "";
  if (value.length <= 8) return "••••";
  return `${value.slice(0, 4)}••••${value.slice(-4)}`;
}

function bridgeAuthorized(req: NextRequest) {
  if (!BRIDGE_SECRET) return true;
  const headerSecret = req.headers.get("x-instaflow-secret") || req.headers.get("x-bridge-secret") || "";
  const { searchParams } = new URL(req.url);
  const querySecret = searchParams.get("secret") || "";
  return headerSecret === BRIDGE_SECRET || querySecret === BRIDGE_SECRET;
}

async function getConnectedAccount(body: Record<string, unknown>) {
  const requestedInstagramId = firstString(
    body.accountInstagramId,
    body.instagram_account_id,
    body.pageInstagramId,
    ENV_INSTAGRAM_ID
  );
  const requestedUsername = normalizeUsername(firstString(
    body.accountUsername,
    body.instagram_account_username,
    body.pageUsername,
    ENV_INSTAGRAM_USERNAME
  ));

  const account = await prisma.instagramAccount.findFirst({
    where: {
      isActive: true,
      OR: [
        ...(requestedInstagramId ? [{ instagramId: requestedInstagramId }] : []),
        ...(requestedUsername ? [{ username: requestedUsername }] : []),
        ...(ENV_INSTAGRAM_ID ? [{ instagramId: ENV_INSTAGRAM_ID }] : []),
        ...(ENV_INSTAGRAM_USERNAME ? [{ username: ENV_INSTAGRAM_USERNAME }] : []),
      ],
    },
    orderBy: { connectedAt: "desc" },
  });

  if (account) return account;

  return prisma.instagramAccount.findFirst({
    where: { isActive: true },
    orderBy: { connectedAt: "desc" },
  });
}

function parseBridgePayload(body: Record<string, unknown>) {
  const contact = asRecord(body.contact);
  const user = asRecord(body.user);
  const subscriber = asRecord(body.subscriber);
  const sender = asRecord(body.sender);
  const lastInput = asRecord(body.last_input);
  const customFields = asRecord(body.custom_fields);

  const instagramUserId = firstString(
    body.instagramUserId,
    body.instagram_user_id,
    body.ig_user_id,
    body.igUserId,
    body.senderId,
    body.sender_id,
    sender.id,
    contact.instagramUserId,
    contact.instagram_user_id,
    contact.id,
    user.id,
    subscriber.id,
    body.subscriber_id,
    customFields.instagram_user_id,
    customFields.ig_user_id
  );

  const username = normalizeUsername(firstString(
    body.username,
    body.instagramUsername,
    body.instagram_username,
    body.ig_username,
    sender.username,
    contact.username,
    contact.instagram_username,
    user.username,
    subscriber.username,
    customFields.instagram_username,
    customFields.ig_username
  ));

  const displayName = firstString(
    body.name,
    body.displayName,
    body.full_name,
    sender.name,
    contact.name,
    contact.full_name,
    user.name,
    subscriber.name,
    subscriber.first_name && subscriber.last_name ? `${subscriber.first_name} ${subscriber.last_name}` : "",
    subscriber.first_name,
    username,
    instagramUserId
  );

  const text = firstString(
    body.message,
    body.text,
    body.lastMessage,
    body.last_message,
    body.dm_text,
    lastInput.text,
    lastInput.message,
    contact.last_input,
    customFields.last_message,
    customFields.dm_text,
    "پیام جدید از پل اتصال"
  );

  const externalId = firstString(
    body.externalId,
    body.external_id,
    body.messageId,
    body.message_id,
    body.mid,
    body.event_id,
    `${body.source || "bridge"}-${instagramUserId || username || Date.now()}-${Date.now()}`
  );

  return { instagramUserId: instagramUserId || username || firstString(subscriber.id, user.id, contact.id), username, displayName, text, externalId };
}

export async function GET(req: NextRequest) {
  const origin = new URL(req.url).origin;
  return NextResponse.json({
    ok: true,
    name: "Instaflow Bridge Webhook",
    url: `${origin}/api/integrations/bridge`,
    method: "POST",
    auth: BRIDGE_SECRET ? "header x-instaflow-secret or ?secret=..." : "not configured",
    secretPreview: BRIDGE_SECRET ? mask(BRIDGE_SECRET) : null,
    supportedSources: ["ManyChat External Request", "Directam webhook/API", "Make/Zapier HTTP POST"],
    requiredMinimum: ["instagramUserId or username", "message/text"],
    sampleBody: {
      instagramUserId: "123456789",
      username: "sample_user",
      name: "Sample User",
      message: "سلام، منوی شانشین را می‌خواهم",
      source: "manychat",
    },
  });
}

export async function POST(req: NextRequest) {
  if (!bridgeAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized_bridge_secret" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const account = await getConnectedAccount(body);

  if (!account) {
    return NextResponse.json({
      ok: false,
      error: "instagram_account_not_configured",
      message: "اول اتصال Instagram را در صفحه /connect ذخیره کن تا پل بتواند لیدها را به اکانت شانشین وصل کند.",
    }, { status: 400 });
  }

  const parsed = parseBridgePayload(body);
  if (!parsed.instagramUserId && !parsed.username) {
    return NextResponse.json({
      ok: false,
      error: "missing_contact_identity",
      message: "در payload باید حداقل instagramUserId یا username ارسال شود.",
    }, { status: 400 });
  }

  const result = await captureAutoLead({
    account,
    instagramUserId: parsed.instagramUserId || parsed.username,
    username: parsed.username || null,
    displayName: parsed.displayName || parsed.username || parsed.instagramUserId,
    text: parsed.text,
    source: "instagram_dm",
    externalId: parsed.externalId,
    rawPayload: { bridge: true, receivedAt: new Date().toISOString(), payload: body },
  });

  return NextResponse.json({
    ok: true,
    source: clean(body.source) || "bridge",
    imported: result?.duplicated ? 0 : 1,
    duplicated: Boolean(result?.duplicated),
    contactId: result?.contact?.id,
    conversationId: result?.conversation?.id,
    message: result?.duplicated ? "این پیام قبلاً ثبت شده بود." : "لید/پیام از پل اتصال ثبت شد.",
  });
}
