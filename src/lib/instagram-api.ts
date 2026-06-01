const DEFAULT_VERSION = process.env.META_GRAPH_VERSION || "v25.0";
const INSTAGRAM_GRAPH_BASE = process.env.INSTAGRAM_GRAPH_BASE || "https://graph.instagram.com";

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
};

export type InstagramProfile = {
  id?: string;
  username?: string;
  name?: string;
  profile_picture_url?: string;
};

export type InstagramConversation = {
  id: string;
  updated_time?: string;
  participants?: unknown;
};

type FetchOptions = {
  version?: string;
  useAbsoluteUrl?: boolean;
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

export function instagramApiUrl(pathOrUrl: string, accessToken: string, options: FetchOptions = {}) {
  const url = options.useAbsoluteUrl || pathOrUrl.startsWith("http")
    ? new URL(pathOrUrl)
    : new URL(`${INSTAGRAM_GRAPH_BASE}/${options.version || DEFAULT_VERSION}${ensurePath(pathOrUrl)}`);

  if (!url.searchParams.has("access_token")) {
    url.searchParams.set("access_token", accessToken);
  }

  return url;
}

export async function fetchInstagramJson<T = Record<string, unknown>>(
  pathOrUrl: string,
  accessToken: string,
  options: FetchOptions = {}
): Promise<{ ok: boolean; status: number; data: T; url: string }> {
  const url = instagramApiUrl(pathOrUrl, accessToken, options);
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

export async function fetchConversations(input: InstagramAccountInput, path?: string) {
  const endpoint = path || `${clean(input.instagramId)}/conversations?fields=id,participants,updated_time`;
  const response = await fetchInstagramJson<{ data?: InstagramConversation[]; paging?: Record<string, unknown>; error?: unknown }>(
    endpoint,
    input.accessToken,
    { useAbsoluteUrl: endpoint.startsWith("http") }
  );

  if (!response.ok) {
    throw new Error(errorMessage(response.data) || "خواندن لیست گفتگوها ناموفق بود.");
  }

  return response.data;
}

export async function runInstagramDiagnostics(input: InstagramAccountInput) {
  const instagramId = clean(input.instagramId);
  const accessToken = clean(input.accessToken);
  const tests: InstagramApiTest[] = [];

  if (!instagramId || !accessToken) {
    return {
      ok: false,
      profile: null,
      conversations: [],
      tests: [{ key: "required", title: "اطلاعات اتصال", endpoint: "local", ok: false, message: "Instagram ID و Token را وارد کنید." }],
      emptyReason: "اطلاعات اتصال کامل نیست.",
    };
  }

  let profile: InstagramProfile | null = null;
  let allConversations: InstagramConversation[] = [];
  const pagingNextCandidates: string[] = [];

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

  const conversationEndpoints = [
    {
      key: "conversations_fields",
      title: "خواندن گفتگوها با فیلدهای کامل",
      endpoint: `${instagramId}/conversations?fields=id,participants,updated_time&limit=25`,
      required: true,
    },
    {
      key: "conversations_nested_messages",
      title: "خواندن گفتگوها همراه ۵ پیام اول",
      endpoint: `${instagramId}/conversations?fields=id,participants,updated_time,messages.limit(5){id,message,from,to,created_time}&limit=10`,
      required: false,
      hint: "اگر این تست خطا داد اما تست ساده موفق بود، مشکل اتصال نیست؛ فقط Meta این فیلد تو در تو را در این حالت برنمی‌گرداند.",
    },
    {
      key: "conversations_basic",
      title: "خواندن گفتگوها ساده",
      endpoint: `${instagramId}/conversations?limit=25`,
      required: true,
    },
  ];

  for (const item of conversationEndpoints) {
    try {
      const response = await fetchInstagramJson<{ data?: InstagramConversation[]; paging?: Record<string, unknown>; error?: unknown }>(item.endpoint, accessToken);
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
        hint: item.hint,
        sample: sample(response.data, accessToken),
        raw: sanitizeInstagramPayload(response.data, accessToken),
        error: response.ok ? undefined : sanitizeInstagramPayload(response.data, accessToken),
      });
    } catch (error) {
      tests.push({ key: item.key, title: item.title, endpoint: item.endpoint, ok: !item.required, message: clean((error as Error).message), hint: item.hint, error });
    }
  }

  // تست مشکل data خالی: اگر Meta لینک next بدهد، چند صفحه بعدی هم بررسی می‌شود تا مطمئن شویم گفتگو در صفحه‌های بعدی پنهان نیست.
  try {
    let nextUrl = pagingNextCandidates[0] || "";
    let page = 0;
    while (nextUrl && page < 3) {
      page += 1;
      const response = await fetchInstagramJson<{ data?: InstagramConversation[]; paging?: Record<string, unknown>; error?: unknown }>(nextUrl, accessToken, { useAbsoluteUrl: true });
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      allConversations = [...allConversations, ...data];
      const nextValue = response.data.paging && typeof response.data.paging.next === "string" ? response.data.paging.next : "";
      if (nextValue) pagingNextCandidates.push(nextValue);
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
    new Map(allConversations.filter((item) => item?.id).map((item) => [item.id, item])).values()
  );

  const profileOk = tests.some((test) => test.key === "profile" && test.ok);
  const conversationEndpointOk = tests.some((test) => ["conversations_fields", "conversations_basic"].includes(test.key) && test.ok);
  const ok = profileOk && conversationEndpointOk;
  const emptyReason = ok && uniqueConversations.length === 0
    ? "اتصال و Permissionها درست است، اما Meta فعلاً گفتگو برنگرداند. در حالت Development معمولاً گفتگوهای کاربران عادی بعد از App Review/Publish کامل قابل دریافت می‌شود."
    : "";

  return {
    ok,
    profile,
    conversations: uniqueConversations,
    tests,
    emptyReason,
  };
}
