import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth";
import { captureAutoLead } from "@/lib/auto-lead";
import { buildAutoReplyDecisionForWorkspace, getAutoReplyMode, isLiveAutoReplyAllowed } from "@/lib/auto-reply";
import { clean, fetchConversations, fetchConversationMessages, fetchFacebookJson, fetchInstagramJson, sendInstagramTextMessage } from "@/lib/instagram-api";
import { ensureInstagramAccountFromConnection, resolveInstagramConnection } from "@/lib/instagram-connection";
import { isMockModeEnabled, MOCK_CONVERSATIONS, MOCK_PROFILE } from "@/lib/mock-instagram-data";

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


function apiErrorMessage(value: unknown) {
  const record = asRecord(value);
  const error = asRecord(record.error);
  return clean(error.message) || clean(error.type) || "Meta API error";
}

function isPageTokenLikelyMissingMessage(message: string) {
  const text = message.toLowerCase();
  return (
    text.includes("page access token") ||
    text.includes("object with id") ||
    text.includes("does not exist") ||
    text.includes("missing permissions") ||
    text.includes("cannot be loaded") ||
    text.includes("unsupported get request")
  );
}

async function derivePageTokenFromUserToken(input: { suppliedToken: string; pageId: string; instagramId?: string; username?: string | null }) {
  const accountsRes = await fetchFacebookJson<{ data?: Array<Record<string, unknown>>; error?: unknown }>(
    "me/accounts?fields=id,name,access_token,instagram_business_account&limit=100",
    input.suppliedToken,
  );
  if (!accountsRes.ok || !Array.isArray(accountsRes.data.data)) return "";

  const wantedPageId = clean(input.pageId);
  const wantedInstagramId = clean(input.instagramId);
  const wantedUsername = clean(input.username).toLowerCase();
  const match = accountsRes.data.data.find((page) => {
    const pageId = clean(page.id);
    const pageName = clean(page.name).toLowerCase();
    const ig = asRecord(page.instagram_business_account);
    const igId = clean(ig.id);
    return pageId === wantedPageId || (wantedInstagramId && igId === wantedInstagramId) || (wantedUsername && pageName === wantedUsername);
  });
  return clean(match?.access_token);
}


async function fetchMessages(conversationId: string, accessToken: string, graph: "instagram" | "facebook" = "instagram") {
  if (graph === "facebook") {
    try {
      const direct = await fetchConversationMessages(conversationId, accessToken, { graph: "facebook" });
      return Array.isArray(direct.data) ? (direct.data as Record<string, unknown>[]) : [];
    } catch {
      return [];
    }
  }

  // بعضی نسخه‌های Graph پیام‌ها را از /messages می‌دهند و بعضی از fields=messages. هر دو مسیر تست می‌شود.
  const direct = await fetchInstagramJson<{ data?: Record<string, unknown>[]; error?: unknown }>(
    `${conversationId}/messages?fields=id,from,to,message,created_time,attachments&limit=10`,
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

  // ⭐ Mock Mode: Sync گفتگوهای Mock به دیتابیس
  if (isMockModeEnabled()) {
    const connection = await resolveInstagramConnection(session.workspaceId);
    if (!connection) {
      return NextResponse.json({ 
        error: "اتصال Mock یافت نشد. لطفاً Environment Variables را بررسی کنید." 
      }, { status: 400 });
    }

    const account = await ensureInstagramAccountFromConnection(session.workspaceId, connection);
    
    let imported = 0;
    let duplicates = 0;
    let checkedConversations = 0;
    let checkedMessages = 0;

    // فقط اولین گفتگو را sync می‌کنیم
    for (const conversation of MOCK_CONVERSATIONS.slice(0, 1)) {
      checkedConversations += 1;
      const messages = conversation.messages || [];
      checkedMessages += messages.length;

      for (const message of messages) {
        const fromId = message.from.id;
        const fromUsername = message.from.username;
        const fromName = message.from.name;
        const text = message.message || "پیام تستی";

        // پیام‌های خروجی خود پیج را skip می‌کنیم
        if (fromId === MOCK_PROFILE.id || fromUsername === MOCK_PROFILE.username) continue;

        const result = await captureAutoLead({
          account,
          instagramUserId: fromId,
          username: fromUsername,
          displayName: fromName,
          text,
          source: "instagram_dm",
          externalId: message.id,
          rawPayload: { conversation, message },
        });

        if (result?.duplicated) {
          duplicates += 1;
        } else if (result) {
          imported += 1;
        }
      }
    }

    return NextResponse.json({
      ok: true,
      mockMode: true,
      checkedConversations,
      checkedMessages,
      imported,
      duplicates,
      sentReplies: 0,
      skippedReplies: 0,
      autoReplyMode: "preview",
      liveSendAllowed: false,
      empty: false,
      message: `Sync Mock موفق: ${checkedConversations} گفتگو بررسی شد، ${imported} لید جدید ایجاد شد.`,
    });
  }

  const connection = await resolveInstagramConnection(session.workspaceId);
  if (!connection?.instagramId || !connection?.accessToken) {
    return NextResponse.json({ error: "ابتدا Instagram ID و Token را در صفحه اتصال یا Environment Variables ذخیره کنید." }, { status: 400 });
  }

  const account = await ensureInstagramAccountFromConnection(session.workspaceId, connection);

  let imported = 0;
  let duplicates = 0;
  let checkedConversations = 0;
  let checkedMessages = 0;
  const debug: Array<Record<string, unknown>> = [];
  let sentReplies = 0;
  let skippedReplies = 0;
  const autoReplyMode = getAutoReplyMode();
  const liveSendAllowed = isLiveAutoReplyAllowed();

  const usePageToken = connection.mode === "page_token" && Boolean(connection.pageId);
  let effectivePageToken = connection.pageAccessToken || connection.accessToken;
  let conversations;
  try {
    conversations = await fetchConversations(
      {
        instagramId: account.instagramId,
        accessToken: connection.accessToken,
        pageId: connection.pageId || "",
        pageAccessToken: effectivePageToken,
      },
      usePageToken
        ? `${connection.pageId}/conversations?platform=instagram&fields=id,updated_time&limit=1`
        : `${account.instagramId}/conversations?fields=id,participants,updated_time&limit=5`
    );
  } catch (error) {
    const message = clean((error as Error).message);
    if (!usePageToken || !isPageTokenLikelyMissingMessage(message)) throw error;
    const derivedToken = await derivePageTokenFromUserToken({
      suppliedToken: effectivePageToken,
      pageId: connection.pageId || "",
      instagramId: account.instagramId,
      username: account.username,
    });
    if (!derivedToken) throw error;
    effectivePageToken = derivedToken;
    conversations = await fetchConversations(
      {
        instagramId: account.instagramId,
        accessToken: connection.accessToken,
        pageId: connection.pageId || "",
        pageAccessToken: effectivePageToken,
      },
      `${connection.pageId}/conversations?platform=instagram&fields=id,updated_time&limit=1`
    );
  }

  const conversationList = Array.isArray(conversations.data) ? conversations.data : [];

  for (const conversation of conversationList.slice(0, 1)) {
    if (!conversation.id) continue;
    checkedConversations += 1;
    const messages = await fetchMessages(conversation.id, usePageToken ? effectivePageToken : connection.accessToken, usePageToken ? "facebook" : "instagram");
    checkedMessages += messages.length;

    for (const message of messages) {
      const from = asRecord(message.from);
      const fromId = firstString(from.id);
      const fromUsername = firstString(from.username);
      const fromName = firstString(from.name, fromUsername, fromId);
      const text = firstString(message.message, "پیام غیرمتنی / مدیا");
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

      if (result?.duplicated) {
        duplicates += 1;
      } else if (result) {
        imported += 1;
        const decision = await buildAutoReplyDecisionForWorkspace({ workspaceId: session.workspaceId, text, source: "instagram_dm" });
        if (decision.shouldReply && !decision.needsHumanReview && decision.mode === "live" && decision.liveSendAllowed) {
          try {
            const sendRes = await sendInstagramTextMessage({
              pageId: connection.pageId || (account as { facebookPageId?: string | null }).facebookPageId || undefined,
              instagramId: account.instagramId,
              accessToken: usePageToken ? effectivePageToken : connection.accessToken,
              recipientId: fromId,
              text: decision.responseText,
            });
            if (sendRes.ok) sentReplies += 1;
            else {
              skippedReplies += 1;
              debug.push({ type: "auto_reply_failed", status: sendRes.status, data: sendRes.data });
            }
          } catch (error) {
            skippedReplies += 1;
            debug.push({ type: "auto_reply_error", message: clean((error as Error).message) });
          }
        } else {
          skippedReplies += 1;
        }
      }
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
    sentReplies,
    skippedReplies,
    autoReplyMode,
    liveSendAllowed,
    empty: conversationList.length === 0,
    message: conversationList.length === 0
      ? "اتصال برقرار است اما Meta فعلاً گفتگویی برنگرداند."
      : liveSendAllowed
        ? `Sync خودکار انجام شد: ${checkedConversations} گفتگو بررسی شد، ${imported} پیام جدید به لید تبدیل شد و ${sentReplies} پاسخ به اینستاگرام ارسال شد.`
        : `Sync انجام شد: ${checkedConversations} گفتگو بررسی شد و ${imported} پیام جدید به لید تبدیل شد. ارسال خودکار هنوز خاموش است؛ برای ارسال واقعی INSTAFLOW_AUTO_REPLY_MODE=live و INSTAFLOW_ALLOW_LIVE_SEND=true را در Railway بگذارید.`,
    debug,
  });
}
