const DEFAULT_VERSION = process.env.META_GRAPH_VERSION || "v25.0";
const INSTAGRAM_GRAPH_BASE = process.env.INSTAGRAM_GRAPH_BASE || "https://graph.instagram.com";
const FACEBOOK_GRAPH_BASE = process.env.META_GRAPH_BASE || "https://graph.facebook.com";

export type InstagramApiTest = {
  key: string;
  title: string;
  endpoint: string;
  ok: boolean;
  status?: number;
  count?: number;
  hasNext?: boolean;
  message?: string;
  hint?: string;
  error?: unknown;
  sample?: unknown;
  raw?: unknown;
};

export type InstagramAccountInput = {
  instagramId: string;
  accessToken: string;
  pageId?: string;
  pageAccessToken?: string;
  username?: string | null;
};

export type InstagramProfile = {
  id?: string;
  username?: string;
  name?: string;
  profile_picture_url?: string;
};

export type InstagramConversationMessage = {
  id: string;
  message?: string;
  from?: { id?: string; username?: string; name?: string };
  to?: { data?: Array<{ id?: string; username?: string; name?: string }> };
  created_time?: string;
  attachments?: unknown;
};

export type InstagramConversation = {
  id: string;
  updated_time?: string;
  participants?: unknown;
  messages?: InstagramConversationMessage[];
};

type FetchOptions = {
  version?: string;
  useAbsoluteUrl?: boolean;
  graph?: "instagram" | "facebook";
};

export function clean(value: unknown) {
  return String(value || "").trim();
}

export function maskToken(token?: string | null) {
  const value = clean(token);
  if (!value) return "";
  if (value.length <= 12) return "••••";
  return `${value.slice(0, 6)}…${value.slice(-6)}`;
}

export function sanitizeInstagramPayload(value: unknown, accessToken?: string): unknown {
  const token = clean(accessToken);
  if (typeof value === "string") {
    let result = value;
    if (token) result = result.split(token).join(maskToken(token));
    result = result.replace(/(access_token=)[^&\s"]+/g, "$1••••");
    result = result.replace(/(access_token%3D)[^%&\s"]+/gi, "$1••••");
    result = result.replace(/(EAA[A-Za-z0-9_\-]{16,})/g, "EAA••••");
    result = result.replace(/(IGA[A-Za-z0-9_\-]{16,})/g, "IGA••••");
    return result;
  }
  if (Array.isArray(value)) return value.map((item) => sanitizeInstagramPayload(item, token));
  if (value && typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      output[key] = sanitizeInstagramPayload(item, token);
    }
    return output;
  }
  return value;
}

function ensurePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function graphBase(graph: FetchOptions["graph"] = "instagram") {
  return graph === "facebook" ? FACEBOOK_GRAPH_BASE : INSTAGRAM_GRAPH_BASE;
}

export function graphApiUrl(pathOrUrl: string, accessToken: string, options: FetchOptions = {}) {
  const url = options.useAbsoluteUrl || pathOrUrl.startsWith("http")
    ? new URL(pathOrUrl)
    : new URL(`${graphBase(options.graph)}/${options.version || DEFAULT_VERSION}${ensurePath(pathOrUrl)}`);

  if (!url.searchParams.has("access_token")) {
    url.searchParams.set("access_token", accessToken);
  }

  return url;
}

export function instagramApiUrl(pathOrUrl: string, accessToken: string, options: FetchOptions = {}) {
  return graphApiUrl(pathOrUrl, accessToken, { ...options, graph: options.graph || "instagram" });
}

export async function fetchGraphJson<T = Record<string, unknown>>(
  pathOrUrl: string,
  accessToken: string,
  options: FetchOptions = {}
): Promise<{ ok: boolean; status: number; data: T; url: string }> {
  const url = graphApiUrl(pathOrUrl, accessToken, options);
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const text = await res.text();
  let data: T;
  try {
    data = JSON.parse(text || "{}") as T;
  } catch {
    data = { raw: text } as T;
  }

  url.searchParams.set("access_token", maskToken(accessToken));
  return { ok: res.ok, status: res.status, data, url: url.toString() };
}

export async function fetchInstagramJson<T = Record<string, unknown>>(
  pathOrUrl: string,
  accessToken: string,
  options: FetchOptions = {}
): Promise<{ ok: boolean; status: number; data: T; url: string }> {
  return fetchGraphJson<T>(pathOrUrl, accessToken, { ...options, graph: options.graph || "instagram" });
}

export async function fetchFacebookJson<T = Record<string, unknown>>(
  pathOrUrl: string,
  accessToken: string,
  options: FetchOptions = {}
): Promise<{ ok: boolean; status: number; data: T; url: string }> {
  return fetchGraphJson<T>(pathOrUrl, accessToken, { ...options, graph: "facebook" });
}

function listCount(data: unknown) {
  const record = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  return Array.isArray(record.data) ? record.data.length : undefined;
}

function hasNext(data: unknown) {
  const record = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const paging = record.paging && typeof record.paging === "object" ? (record.paging as Record<string, unknown>) : {};
  return typeof paging.next === "string" && paging.next.length > 0;
}

function sample(data: unknown, accessToken?: string) {
  const record = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const value = Array.isArray(record.data) ? record.data.slice(0, 2) : record;
  return sanitizeInstagramPayload(value, accessToken);
}

function errorMessage(data: unknown) {
  const record = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const error = record.error && typeof record.error === "object" ? (record.error as Record<string, unknown>) : null;
  if (!error) return undefined;
  return clean(error.message) || clean(error.type) || "Instagram API error";
}

function isPageMode(input: InstagramAccountInput) {
  return Boolean(clean(input.pageId) && clean(input.pageAccessToken || input.accessToken));
}

function pageToken(input: InstagramAccountInput) {
  return clean(input.pageAccessToken) || clean(input.accessToken);
}

export async function verifyInstagramProfile(input: InstagramAccountInput) {
  const instagramId = clean(input.instagramId);
  const accessToken = clean(input.accessToken);
  if (!instagramId || !accessToken) {
    throw new Error("Instagram ID و Access Token الزامی است.");
  }

  const response = await fetchInstagramJson<InstagramProfile | { error?: unknown }>(
    `${instagramId}?fields=id,username,name,profile_picture_url`,
    accessToken
  );

  if (!response.ok) {
    throw new Error(errorMessage(response.data) || "تست پروفایل اینستاگرام ناموفق بود.");
  }

  return response.data as InstagramProfile;
}

export type PageProfile = {
  id?: string;
  name?: string;
  instagram_business_account?: { id?: string; username?: string; name?: string };
};

export async function verifyPageProfile(input: InstagramAccountInput) {
  const pageId = clean(input.pageId);
  const token = pageToken(input);
  if (!pageId || !token) {
    throw new Error("Page ID و Page Access Token الزامی است.");
  }

  const response = await fetchFacebookJson<PageProfile | { error?: unknown }>(
    `${pageId}?fields=id,name,instagram_business_account`,
    token
  );

  if (!response.ok) {
    throw new Error(errorMessage(response.data) || "تست Page Token ناموفق بود.");
  }

  return response.data as PageProfile;
}

export async function fetchConversationMessages(conversationId: string, accessToken: string, options: FetchOptions = {}) {
  const graph = options.graph || "facebook";
  const withAttachments = await fetchGraphJson<{ data?: InstagramConversationMessage[]; paging?: Record<string, unknown>; error?: unknown }>(
    `${conversationId}/messages?fields=id,message,from,to,created_time,attachments&limit=10`,
    accessToken,
    { ...options, graph }
  );

  if (withAttachments.ok) return withAttachments.data;

  // بعضی نسخه‌ها/پیام‌ها فیلد attachments را در Graph API برنمی‌گردانند؛
  // برای اینکه خواندن دایرکت خراب نشود، یک بار با فیلدهای ساده‌تر تلاش می‌کنیم.
  const basic = await fetchGraphJson<{ data?: InstagramConversationMessage[]; paging?: Record<string, unknown>; error?: unknown }>(
    `${conversationId}/messages?fields=id,message,from,to,created_time&limit=10`,
    accessToken,
    { ...options, graph }
  );

  if (!basic.ok) {
    throw new Error(errorMessage(basic.data) || errorMessage(withAttachments.data) || "خواندن پیام‌های گفتگو ناموفق بود.");
  }

  return basic.data;
}

export async function fetchConversations(input: InstagramAccountInput, path?: string) {
  const pageMode = isPageMode(input);
  const token = pageMode ? pageToken(input) : clean(input.accessToken);
  const endpoint = path || (pageMode
    ? `${clean(input.pageId)}/conversations?platform=instagram&fields=id,updated_time&limit=1`
    : `${clean(input.instagramId)}/conversations?fields=id,participants,updated_time`);
  const response = await fetchGraphJson<{ data?: InstagramConversation[]; paging?: Record<string, unknown>; error?: unknown }>(
    endpoint,
    token,
    { useAbsoluteUrl: endpoint.startsWith("http"), graph: pageMode ? "facebook" : "instagram" }
  );

  if (!response.ok) {
    throw new Error(errorMessage(response.data) || "خواندن لیست گفتگوها ناموفق بود.");
  }

  return response.data;
}

async function fetchFirstMessagesForDiagnostics(conversations: InstagramConversation[], token: string) {
  const output: InstagramConversation[] = [];
  for (const conversation of conversations.slice(0, 1)) {
    if (!conversation.id) continue;
    try {
      const messages = await fetchConversationMessages(conversation.id, token, { graph: "facebook" });
      output.push({ ...conversation, messages: Array.isArray(messages.data) ? messages.data.slice(0, 10) : [] });
    } catch {
      output.push(conversation);
    }
  }
  return output;
}

export async function runInstagramDiagnostics(input: InstagramAccountInput) {
  const instagramId = clean(input.instagramId);
  const accessToken = clean(input.accessToken);
  const pageId = clean(input.pageId);
  const pageAccessToken = pageToken(input);
  const tests: InstagramApiTest[] = [];

  if (!instagramId || !accessToken) {
    return {
      ok: false,
      mode: "instagram_login",
      profile: null,
      conversations: [],
      tests: [{ key: "required", title: "اطلاعات اتصال", endpoint: "local", ok: false, message: "Instagram ID و Token را وارد کنید." }],
      emptyReason: "اطلاعات اتصال کامل نیست.",
    };
  }

  const pageMode = Boolean(pageId && pageAccessToken);
  let profile: InstagramProfile | null = null;
  let pageProfile: PageProfile | null = null;
  let allConversations: InstagramConversation[] = [];
  const pagingNextCandidates: string[] = [];

  if (pageMode) {
    const pageEndpoint = `${pageId}?fields=id,name,instagram_business_account`;
    try {
      const pageRes = await fetchFacebookJson<PageProfile | { error?: unknown }>(pageEndpoint, pageAccessToken);
      pageProfile = pageRes.ok ? (pageRes.data as PageProfile) : null;
      const pageIgId = clean((pageProfile as PageProfile | null)?.instagram_business_account?.id) || instagramId;
      profile = {
        id: pageIgId,
        username: clean(input.username) || clean(pageProfile?.name) || "instagram",
        name: clean(pageProfile?.name) || clean(input.username) || "instagram",
      };
      tests.push({
        key: "page_profile",
        title: "تست Page و اتصال Instagram Business",
        endpoint: pageRes.url,
        ok: pageRes.ok,
        status: pageRes.status,
        message: pageRes.ok ? "Page Token معتبر است و Instagram Business Account متصل شناسایی شد." : errorMessage(pageRes.data),
        sample: pageRes.ok ? sanitizeInstagramPayload(pageRes.data, pageAccessToken) : undefined,
        raw: sanitizeInstagramPayload(pageRes.data, pageAccessToken),
        error: pageRes.ok ? undefined : sanitizeInstagramPayload(pageRes.data, pageAccessToken),
      });
    } catch (error) {
      tests.push({ key: "page_profile", title: "تست Page و اتصال Instagram Business", endpoint: pageEndpoint, ok: false, message: clean((error as Error).message), error });
    }

    // v15: برای اکانت‌های پر دایرکت، درخواست لیست کامل گفتگوها در Development به خطای
    // "Please reduce the amount of data" یا Timeout می‌خورد. پس ابتدا فقط آخرین گفتگو
    // را با سبک‌ترین فیلدها می‌گیریم؛ این دقیقاً همان تست موفق Graph API Explorer است.
    const conversationEndpoints = [
      {
        key: "page_conversations_probe",
        title: "تست سبک آخرین گفتگو از Page Token",
        endpoint: `${pageId}/conversations?platform=instagram&limit=1&fields=id,updated_time`,
        required: true,
      },
    ];

    for (const item of conversationEndpoints) {
      try {
        const response = await fetchFacebookJson<{ data?: InstagramConversation[]; paging?: Record<string, unknown>; error?: unknown }>(item.endpoint, pageAccessToken);
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        if (response.ok) allConversations = [...allConversations, ...data];
        const nextValue = response.data.paging && typeof response.data.paging.next === "string" ? response.data.paging.next : "";
        if (response.ok && nextValue) pagingNextCandidates.push(nextValue);
        tests.push({
          key: item.key,
          title: item.title,
          endpoint: response.url,
          ok: item.required ? response.ok : true,
          status: response.status,
          count: listCount(response.data),
          hasNext: hasNext(response.data),
          message: response.ok
            ? data.length
              ? `${data.length} گفتگو دریافت شد.`
              : "اتصال برقرار است، اما data خالی برگشت."
            : errorMessage(response.data),
          hint: response.ok ? "مسیر درست دایرکت برای این پروژه همین Page Token است." : "اگر خطا Advanced Access/Timeout باشد، اتصال درست است اما برای حجم بالای کاربران غیرتستر باید Review کامل شود.",
          sample: sample(response.data, pageAccessToken),
          raw: sanitizeInstagramPayload(response.data, pageAccessToken),
          error: response.ok ? undefined : sanitizeInstagramPayload(response.data, pageAccessToken),
        });
      } catch (error) {
        tests.push({ key: item.key, title: item.title, endpoint: item.endpoint, ok: !item.required, message: clean((error as Error).message), error });
      }
    }

    const uniqueBase = Array.from(new Map(allConversations.filter((item) => item?.id).map((item) => [item.id, item])).values());
    const uniqueConversations = await fetchFirstMessagesForDiagnostics(uniqueBase, pageAccessToken);
    const ok = tests.some((test) => test.key === "page_profile" && test.ok) && tests.some((test) => test.key === "page_conversations_probe" && test.ok);
    const emptyReason = ok && uniqueConversations.length === 0
      ? "اتصال Page Token برقرار است، اما Meta فعلاً گفتگویی برنگرداند. اگر خطای Timeout/Advanced Access دیدی، برای دایرکت‌های واقعی باید instagram_manage_messages را Review/Advanced Access کنی."
      : "";

    return {
      ok,
      mode: "page_token",
      profile,
      pageProfile,
      pageId,
      configuredInstagramId: instagramId,
      resolvedInstagramId: clean(pageProfile?.instagram_business_account?.id) || instagramId,
      idMismatch: Boolean(clean(pageProfile?.instagram_business_account?.id) && clean(pageProfile?.instagram_business_account?.id) !== instagramId),
      conversations: uniqueConversations,
      tests,
      emptyReason,
    };
  }

  let allInstagramConversations: InstagramConversation[] = [];
  const profileEndpoint = `${instagramId}?fields=id,username,name,profile_picture_url`;
  try {
    const profileRes = await fetchInstagramJson<InstagramProfile | { error?: unknown }>(profileEndpoint, accessToken);
    profile = profileRes.ok ? (profileRes.data as InstagramProfile) : null;
    tests.push({
      key: "profile",
      title: "تست شناسایی اکانت",
      endpoint: profileRes.url,
      ok: profileRes.ok,
      status: profileRes.status,
      message: profileRes.ok ? "اکانت اینستاگرام با موفقیت شناسایی شد." : errorMessage(profileRes.data),
      sample: profileRes.ok ? sanitizeInstagramPayload(profileRes.data, accessToken) : undefined,
      raw: sanitizeInstagramPayload(profileRes.data, accessToken),
      error: profileRes.ok ? undefined : sanitizeInstagramPayload(profileRes.data, accessToken),
    });
  } catch (error) {
    tests.push({ key: "profile", title: "تست شناسایی اکانت", endpoint: profileEndpoint, ok: false, message: clean((error as Error).message), error });
  }

  const resolvedInstagramId = clean(profile?.id) || instagramId;
  const idMismatch = Boolean(resolvedInstagramId && instagramId && resolvedInstagramId !== instagramId);

  if (idMismatch) {
    tests.push({
      key: "id_resolution",
      title: "تشخیص ID واقعی API",
      endpoint: "profile.id",
      ok: true,
      message: `ID تنظیم‌شده ${instagramId} است، اما API برای همین اکانت ID ${resolvedInstagramId} را برگرداند؛ از این نسخه گفتگوها با ID واقعی هم تست می‌شوند.`,
      sample: { configuredInstagramId: instagramId, resolvedInstagramId },
      raw: { configuredInstagramId: instagramId, resolvedInstagramId },
    });
  }

  const idCandidates = Array.from(new Set([resolvedInstagramId, instagramId].filter((value): value is string => Boolean(value))));
  const conversationEndpoints = idCandidates.flatMap((candidateId, index) => {
    const suffix = candidateId === resolvedInstagramId ? "ID واقعی API" : "ID تنظیم‌شده";
    const prefix = idCandidates.length > 1 ? `${suffix} - ` : "";
    return [
      {
        key: `conversations_fields_${index}`,
        title: `${prefix}خواندن گفتگوها با فیلدهای کامل`,
        endpoint: `${candidateId}/conversations?fields=id,participants,updated_time&limit=25`,
        required: true,
      },
      {
        key: `conversations_nested_messages_${index}`,
        title: `${prefix}خواندن گفتگوها همراه ۵ پیام اول`,
        endpoint: `${candidateId}/conversations?fields=id,participants,updated_time,messages.limit(5){id,message,from,to,created_time}&limit=10`,
        required: false,
        hint: "اگر این تست خطا داد اما تست ساده موفق بود، مشکل اتصال نیست؛ فقط Meta این فیلد تو در تو را در این حالت برنمی‌گرداند.",
      },
      {
        key: `conversations_basic_${index}`,
        title: `${prefix}خواندن گفتگوها ساده`,
        endpoint: `${candidateId}/conversations?limit=25`,
        required: true,
      },
    ];
  });

  for (const item of conversationEndpoints) {
    try {
      const response = await fetchInstagramJson<{ data?: InstagramConversation[]; paging?: Record<string, unknown>; error?: unknown }>(item.endpoint, accessToken);
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      if (response.ok) allInstagramConversations = [...allInstagramConversations, ...data];
      const nextValue = response.data.paging && typeof response.data.paging.next === "string" ? response.data.paging.next : "";
      if (response.ok && nextValue) pagingNextCandidates.push(nextValue);
      tests.push({
        key: item.key,
        title: item.title,
        endpoint: response.url,
        ok: item.required ? response.ok : true,
        status: response.status,
        count: listCount(response.data),
        hasNext: hasNext(response.data),
        message: response.ok
          ? data.length
            ? `${data.length} گفتگو دریافت شد.`
            : "اتصال برقرار است، اما data خالی برگشت."
          : errorMessage(response.data),
        hint: item.hint,
        sample: sample(response.data, accessToken),
        raw: sanitizeInstagramPayload(response.data, accessToken),
        error: response.ok ? undefined : sanitizeInstagramPayload(response.data, accessToken),
      });
    } catch (error) {
      tests.push({ key: item.key, title: item.title, endpoint: item.endpoint, ok: !item.required, message: clean((error as Error).message), hint: item.hint, error });
    }
  }

  try {
    let nextUrl = pagingNextCandidates[0] || "";
    let page = 0;
    while (nextUrl && page < 3) {
      page += 1;
      const response = await fetchInstagramJson<{ data?: InstagramConversation[]; paging?: Record<string, unknown>; error?: unknown }>(nextUrl, accessToken, { useAbsoluteUrl: true });
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      allInstagramConversations = [...allInstagramConversations, ...data];
      tests.push({
        key: `paging_${page}`,
        title: `بررسی صفحه بعدی گفتگوها ${page}`,
        endpoint: response.url,
        ok: response.ok,
        status: response.status,
        count: data.length,
        hasNext: hasNext(response.data),
        message: response.ok ? (data.length ? `${data.length} گفتگو در صفحه بعدی پیدا شد.` : "این صفحه هم خالی بود.") : errorMessage(response.data),
        sample: sample(response.data, accessToken),
        raw: sanitizeInstagramPayload(response.data, accessToken),
        error: response.ok ? undefined : sanitizeInstagramPayload(response.data, accessToken),
      });

      const nextPaging = response.data.paging || {};
      nextUrl = typeof nextPaging.next === "string" ? nextPaging.next : "";
    }
  } catch (error) {
    tests.push({ key: "paging_error", title: "بررسی صفحه‌های بعدی", endpoint: "paging.next", ok: false, message: clean((error as Error).message), error });
  }

  const uniqueConversations = Array.from(
    new Map(allInstagramConversations.filter((item) => item?.id).map((item) => [item.id, item])).values()
  );

  const profileOk = tests.some((test) => test.key === "profile" && test.ok);
  const conversationEndpointOk = tests.some((test) => /^conversations_(fields|basic)_/.test(test.key) && test.ok);
  const ok = profileOk && conversationEndpointOk;
  const emptyReason = ok && uniqueConversations.length === 0
    ? idMismatch
      ? "اتصال و Permissionها درست است و هر دو ID تنظیم‌شده و ID واقعی API تست شدند، اما مسیر Instagram Login گفتگویی برنگرداند. برای این پروژه مسیر درست Page Token است: graph.facebook.com/{PAGE_ID}/conversations?platform=instagram."
      : "اتصال و Permissionها درست است، اما مسیر Instagram Login گفتگویی برنگرداند. برای این پروژه مسیر درست Page Token است: graph.facebook.com/{PAGE_ID}/conversations?platform=instagram."
    : "";

  return {
    ok,
    mode: "instagram_login",
    profile,
    configuredInstagramId: instagramId,
    resolvedInstagramId,
    idMismatch,
    conversations: uniqueConversations,
    tests,
    emptyReason,
  };
}

export async function postGraphJson<T = Record<string, unknown>>(
  pathOrUrl: string,
  accessToken: string,
  body: Record<string, unknown>,
  options: FetchOptions = {}
): Promise<{ ok: boolean; status: number; data: T; url: string }> {
  const url = graphApiUrl(pathOrUrl, accessToken, options);
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await res.text();
  let data: T;
  try {
    data = JSON.parse(text || "{}") as T;
  } catch {
    data = { raw: text } as T;
  }

  url.searchParams.set("access_token", maskToken(accessToken));
  return { ok: res.ok, status: res.status, data, url: url.toString() };
}

export async function postFacebookJson<T = Record<string, unknown>>(
  pathOrUrl: string,
  accessToken: string,
  body: Record<string, unknown>,
  options: FetchOptions = {}
): Promise<{ ok: boolean; status: number; data: T; url: string }> {
  return postGraphJson<T>(pathOrUrl, accessToken, body, { ...options, graph: "facebook" });
}

export async function sendInstagramTextMessage(input: {
  instagramId: string;
  accessToken: string;
  recipientId: string;
  text: string;
}) {
  const instagramId = clean(input.instagramId);
  const recipientId = clean(input.recipientId);
  const text = clean(input.text).slice(0, 950);
  if (!instagramId || !recipientId || !text) {
    throw new Error("instagramId, recipientId و متن پیام برای ارسال دایرکت الزامی است.");
  }

  return postFacebookJson(
    `${instagramId}/messages`,
    input.accessToken,
    {
      recipient: { id: recipientId },
      message: { text },
    }
  );
}

export async function sendInstagramPrivateReply(input: {
  commentId: string;
  accessToken: string;
  text: string;
}) {
  const commentId = clean(input.commentId);
  const text = clean(input.text).slice(0, 950);
  if (!commentId || !text) {
    throw new Error("commentId و متن پاسخ خصوصی الزامی است.");
  }

  return postFacebookJson(
    `${commentId}/private_replies`,
    input.accessToken,
    { message: text }
  );
}

export async function replyToInstagramComment(input: {
  commentId: string;
  accessToken: string;
  text: string;
}) {
  const commentId = clean(input.commentId);
  const text = clean(input.text).slice(0, 950);
  if (!commentId || !text) {
    throw new Error("commentId و متن پاسخ کامنت الزامی است.");
  }

  return postFacebookJson(
    `${commentId}/replies`,
    input.accessToken,
    { message: text }
  );
}
