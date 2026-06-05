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


function isPageTokenLikelyMissing(value: unknown) {
  const message = apiErrorMessage(value).toLowerCase();
  return (
    message.includes("page access token") ||
    message.includes("object with id") ||
    message.includes("does not exist") ||
    message.includes("missing permissions") ||
    message.includes("cannot be loaded") ||
    message.includes("unsupported get request")
  );
}

async function tryResolvePageAccessTokenFromUserToken(input: {
  suppliedToken: string;
  pageId: string;
  instagramId?: string;
  username?: string;
}) {
  const accountsRes = await fetchFacebookJson<{ data?: Array<Record<string, unknown>>; error?: unknown }>(
    "me/accounts?fields=id,name,access_token,instagram_business_account&limit=100",
    input.suppliedToken,
  );

  if (!accountsRes.ok || !Array.isArray(accountsRes.data.data)) {
    return {
      ok: false,
      reason: apiErrorMessage(accountsRes.data),
      raw: sanitizeInstagramPayload(accountsRes.data, input.suppliedToken),
    };
  }

  const wantedPageId = clean(input.pageId);
  const wantedInstagramId = clean(input.instagramId);
  const wantedUsername = clean(input.username).toLowerCase();

  const match = accountsRes.data.data.find((page) => {
    const pageId = clean(page.id);
    const pageName = clean(page.name).toLowerCase();
    const ig = asRecord(page.instagram_business_account);
    const igId = clean(ig.id);
    return (
      pageId === wantedPageId ||
      (wantedInstagramId && igId === wantedInstagramId) ||
      (wantedUsername && pageName === wantedUsername)
    );
  });

  const accessToken = clean(match?.access_token);
  if (!match || !accessToken) {
    return {
      ok: false,
      reason: "Page در /me/accounts پیدا شدنی نبود یا access_token برنگشت. مطمئن شو META_PAGE_ACCESS_TOKEN واقعاً Page Token همان shanshin.rest است.",
      raw: sanitizeInstagramPayload(accountsRes.data, input.suppliedToken),
    };
  }

  return {
    ok: true,
    page: sanitizeInstagramPayload(match, accessToken),
    pageAccessToken: accessToken,
  };
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

  let effectivePageAccessToken = pageAccessToken;
  let tokenSource = connection?.source || "server_env";
  let tokenResolvedFromMeAccounts: unknown = null;

  let profileRes = await fetchFacebookJson<Record<string, unknown>>(
    `${pageId}?fields=id,name,instagram_business_account`,
    effectivePageAccessToken,
  );

  if (!profileRes.ok && isPageTokenLikelyMissing(profileRes.data)) {
    const derived = await tryResolvePageAccessTokenFromUserToken({
      suppliedToken: pageAccessToken,
      pageId,
      instagramId,
      username,
    });
    const derivedToken = clean((derived as Record<string, unknown>).pageAccessToken);
    if (derived.ok && derivedToken) {
      effectivePageAccessToken = derivedToken;
      tokenSource = "derived_page_token_from_user_token";
      tokenResolvedFromMeAccounts = (derived as Record<string, unknown>).page;
      profileRes = await fetchFacebookJson<Record<string, unknown>>(
        `${pageId}?fields=id,name,instagram_business_account`,
        effectivePageAccessToken,
      );
    } else {
      tokenResolvedFromMeAccounts = derived;
    }
  }

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
      tokenPreview: maskToken(effectivePageAccessToken),
      tokenSource,
      tokenResolvedFromMeAccounts,
      raw: sanitizeInstagramPayload(profileRes.data, effectivePageAccessToken),
      conversations: [],
    }, { status: 200 });
  }

  // v18: اگر اشتباهی User Token در META_PAGE_ACCESS_TOKEN گذاشته شده باشد،
  // /PAGE_ID/profile ممکن است جواب بدهد اما /conversations با خطای Unsupported get request رد شود.
  // در این حالت از /me/accounts همان User Token را به Page Token واقعی تبدیل و دوباره تست می‌کنیم.
  let conversationsRes = await fetchFacebookJson<{ data?: Array<Record<string, unknown>>; paging?: unknown; error?: unknown }>(
    `${pageId}/conversations?platform=instagram&limit=1&fields=id,updated_time`,
    effectivePageAccessToken,
  );

  if (!conversationsRes.ok && isPageTokenLikelyMissing(conversationsRes.data)) {
    const derived = await tryResolvePageAccessTokenFromUserToken({
      suppliedToken: pageAccessToken,
      pageId,
      instagramId: resolvedInstagramId || instagramId,
      username,
    });
    const derivedToken = clean((derived as Record<string, unknown>).pageAccessToken);
    if (derived.ok && derivedToken && derivedToken !== effectivePageAccessToken) {
      effectivePageAccessToken = derivedToken;
      tokenSource = "derived_page_token_from_user_token";
      tokenResolvedFromMeAccounts = (derived as Record<string, unknown>).page;
      conversationsRes = await fetchFacebookJson<{ data?: Array<Record<string, unknown>>; paging?: unknown; error?: unknown }>(
        `${pageId}/conversations?platform=instagram&limit=1&fields=id,updated_time`,
        effectivePageAccessToken,
      );
    } else {
      tokenResolvedFromMeAccounts = derived;
    }
  }

  if (!conversationsRes.ok) {
    return NextResponse.json({
      ok: false,
      stage: "conversations",
      advancedAccessNeeded: isAdvancedAccessError(conversationsRes.data),
      pageTokenLikelyMissing: isPageTokenLikelyMissing(conversationsRes.data),
      error: apiErrorMessage(conversationsRes.data),
      profile: { id: resolvedInstagramId, username, name: pageName },
      pageId,
      tokenPreview: maskToken(effectivePageAccessToken),
      tokenSource,
      tokenResolvedFromMeAccounts,
      hint: isPageTokenLikelyMissing(conversationsRes.data)
        ? "این خطا معمولاً وقتی می‌آید که به جای Page Access Token واقعی، User Token یا توکن صفحه/اپ اشتباه ذخیره شده باشد. Page Token را از خروجی me/accounts همان Page بگیر یا اجازه بده برنامه از User Token آن را استخراج کند."
        : "اگر خطا Advanced Access/Timeout باشد، اتصال درست است اما برای حجم بالای کاربران غیرتستر باید Review کامل شود.",
      raw: sanitizeInstagramPayload(conversationsRes.data, effectivePageAccessToken),
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
      effectivePageAccessToken,
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
    source: tokenSource,
    pageId,
    configuredInstagramId: instagramId,
    resolvedInstagramId,
    profile: { id: resolvedInstagramId, username, name: pageName },
    pageProfile: sanitizeInstagramPayload(pageProfile, pageAccessToken),
    tokenPreview: maskToken(effectivePageAccessToken),
    tokenResolvedFromMeAccounts,
    conversations,
    emptyReason: conversations.length ? "" : "اتصال Page Token درست است، اما Meta فعلاً گفتگویی برنگرداند.",
  });
}
