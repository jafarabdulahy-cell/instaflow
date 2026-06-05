import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth";
import { buildAutoReplyDecisionForWorkspace } from "@/lib/auto-reply";
import { clean, sanitizeInstagramPayload, sendInstagramTextMessage } from "@/lib/instagram-api";
import { ensureInstagramAccountFromConnection, resolveInstagramConnection } from "@/lib/instagram-connection";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function apiErrorMessage(value: unknown) {
  const record = asRecord(value);
  const error = asRecord(record.error);
  return clean(error.message) || clean(error.type) || "Meta API error";
}

export async function POST(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const recipientId = clean(body.recipientId);
  const sourceText = clean(body.sourceText);
  const manualText = clean(body.text);
  const confirm = clean(body.confirm);

  if (confirm !== "send_to_instagram") {
    return NextResponse.json({ error: "برای جلوگیری از ارسال اشتباه، confirm باید send_to_instagram باشد." }, { status: 400 });
  }

  if (!recipientId) {
    return NextResponse.json({ error: "شناسه گیرنده اینستاگرام از پیام ورودی پیدا نشد." }, { status: 400 });
  }

  const connection = await resolveInstagramConnection(session.workspaceId);
  if (!connection?.instagramId || !connection?.accessToken) {
    return NextResponse.json({ error: "ابتدا اتصال Instagram را تنظیم کنید." }, { status: 400 });
  }

  const account = await ensureInstagramAccountFromConnection(session.workspaceId, connection);
  const decision = await buildAutoReplyDecisionForWorkspace({ workspaceId: session.workspaceId, text: sourceText || manualText, source: "instagram_dm" });
  const text = manualText || decision.responseText;

  if (!text) {
    return NextResponse.json({ error: "متن پاسخ خالی است." }, { status: 400 });
  }

  if (recipientId === account.instagramId || recipientId === connection.instagramId) {
    return NextResponse.json({ error: "این پیام ورودی از سمت خود پیج است و نباید به خودش ارسال شود." }, { status: 400 });
  }

  const accessToken = clean(connection.pageAccessToken || connection.accessToken || account.accessToken);
  const pageId = clean(connection.pageId || (account as { facebookPageId?: string | null }).facebookPageId);

  const response = await sendInstagramTextMessage({
    pageId,
    instagramId: account.instagramId,
    accessToken,
    recipientId,
    text,
  });

  if (!response.ok) {
    return NextResponse.json({
      ok: false,
      error: apiErrorMessage(response.data),
      status: response.status,
      decision,
      raw: sanitizeInstagramPayload(response.data, accessToken),
    }, { status: 200 });
  }

  return NextResponse.json({
    ok: true,
    message: "پاسخ به دایرکت اینستاگرام ارسال شد.",
    sentText: text,
    recipientId,
    decision,
    status: response.status,
    raw: sanitizeInstagramPayload(response.data, accessToken),
  });
}
