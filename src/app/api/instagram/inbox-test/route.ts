import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth";
import { clean, fetchFacebookJson, maskToken, sanitizeInstagramPayload } from "@/lib/instagram-api";
import { resolveInstagramConnection } from "@/lib/instagram-connection";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function apiErrorMessage(value: unknown) {
  const record = asRecord(value);
  const error = asRecord(record.error);
  return clean(error.message) || clean(error.type) || "Meta API error";
}

function isAdvancedAccessError(value: unknown) {
  const message = apiErrorMessage(value).toLowerCase();
  const text = JSON.stringify(value || {}).toLowerCase();
  return (
    message.includes("advanced access") ||
    message.includes("too many conversations") ||
    message.includes("please reduce") ||
    message.includes("timed out") ||
    text.includes("instagram_manage_messages") ||
    text.includes("2534084")
  );
}

export async function GET(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const connection = await resolveInstagramConnection(session.workspaceId);
  const pageId = clean(connection?.pageId);
  const pageAccessToken = clean(connection?.pageAccessToken || connection?.accessToken);
  const instagramId = clean(connection?.instagramId);
  const username = clean(connection?.username) || "shanshin.rest";

  if (!pageId || !pageAccessToken) {
    return NextResponse.json({
      ok: false,
      error: "META_PAGE_ID و META_PAGE_ACCESS_TOKEN روی سرور تنظیم نشده‌اند.",
      mode: connection?.mode || "missing",
      conversations: [],
    }, { status: 400 });
  }

  const profileRes = await fetchFacebookJson<Record<string, unknown>>(
    `${pageId}?fields=id,name,instagram_business_account`,
    pageAccessToken,
  );

  const pageProfile = profileRes.ok ? profileRes.data : null;
  const resolvedInstagramId = clean(asRecord(asRecord(pageProfile).instagram_business_account).id) || instagramId;
  const pageName = clean(asRecord(pageProfile).name) || username;

  if (!profileRes.ok) {
    return NextResponse.json({
      ok: false,
      stage: "page_profile",
      error: apiErrorMessage(profileRes.data),
      profile: { id: resolvedInstagramId, username, name: pageName },
      pageId,
      tokenPreview: maskToken(pageAccessToken),
      raw: sanitizeInstagramPayload(profileRes.data, pageAccessToken),
      conversations: [],
    }, { status: 200 });
  }

  // v17: بسیار سبک؛ فقط آخرین گفتگو و فقط id/updated_time.
  // این همان تستی است که در Graph API Explorer موفق شد.
  const conversationsRes = await fetchFacebookJson<{ data?: Array<Record<string, unknown>>; paging?: unknown; error?: unknown }>(
    `${pageId}/conversations?platform=instagram&limit=1&fields=id,updated_time`,
    pageAccessToken,
  );

  if (!conversationsRes.ok) {
    return NextResponse.json({
      ok: false,
      stage: "conversations",
      advancedAccessNeeded: isAdvancedAccessError(conversationsRes.data),
      error: apiErrorMessage(conversationsRes.data),
      profile: { id: resolvedInstagramId, username, name: pageName },
      pageId,
      tokenPreview: maskToken(pageAccessToken),
      raw: sanitizeInstagramPayload(conversationsRes.data, pageAccessToken),
      conversations: [],
    }, { status: 200 });
  }

  const baseConversations = Array.isArray(conversationsRes.data.data) ? conversationsRes.data.data : [];
  const conversations = [];

  for (const conversation of baseConversations.slice(0, 1)) {
    const id = clean(conversation.id);
    if (!id) continue;

    // v17: اول فیلدهای ساده را می‌خوانیم؛ attachments را فعلاً در تست اولیه نمی‌خواهیم
    // چون بعضی اکانت‌ها را کند یا خطادار می‌کند.
    const messagesRes = await fetchFacebookJson<{ data?: Array<Record<string, unknown>>; error?: unknown }>(
      `${id}/messages?fields=id,message,from,to,created_time&limit=10`,
      pageAccessToken,
    );

    conversations.push({
      id,
      updated_time: clean(conversation.updated_time),
      messages: messagesRes.ok && Array.isArray(messagesRes.data.data) ? messagesRes.data.data : [],
      messagesError: messagesRes.ok ? undefined : apiErrorMessage(messagesRes.data),
    });
  }

  return NextResponse.json({
    ok: true,
    mode: "page_token",
    source: connection?.source || "server_env",
    pageId,
    configuredInstagramId: instagramId,
    resolvedInstagramId,
    profile: { id: resolvedInstagramId, username, name: pageName },
    pageProfile: sanitizeInstagramPayload(pageProfile, pageAccessToken),
    tokenPreview: maskToken(pageAccessToken),
    conversations,
    emptyReason: conversations.length ? "" : "اتصال Page Token درست است، اما Meta فعلاً گفتگویی برنگرداند.",
  });
}
