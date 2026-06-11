/**
 * Mock Instagram Data برای تست لوکال بدون نیاز به اتصال واقعی Meta API
 * این فایل داده‌های تستی برای Conversations، Messages و Profile فراهم می‌کند
 */

export type MockInstagramProfile = {
  id: string;
  username: string;
  name: string;
  profile_picture_url?: string;
};

export type MockInstagramMessage = {
  id: string;
  message?: string;
  from: { id: string; username: string; name: string };
  to?: { data: Array<{ id: string; username: string; name: string }> };
  created_time: string;
  attachments?: unknown;
};

export type MockInstagramConversation = {
  id: string;
  updated_time: string;
  participants?: unknown;
  messages?: MockInstagramMessage[];
};

// پروفایل تستی
export const MOCK_PROFILE: MockInstagramProfile = {
  id: "17841453193519327",
  username: "shanshin.rest",
  name: "شانشین رستوران",
  profile_picture_url: "https://via.placeholder.com/150",
};

// پیام‌های تستی با کلمات کلیدی مختلف
const mockMessages: MockInstagramMessage[] = [
  {
    id: "mock_msg_001",
    message: "سلام، منو دارید؟",
    from: {
      id: "mock_user_001",
      username: "ali_rezaei",
      name: "علی رضایی",
    },
    created_time: new Date(Date.now() - 3600000).toISOString(), // 1 ساعت پیش
  },
  {
    id: "mock_msg_002",
    message: "بله البته، منو را برایتان ارسال می‌کنم.",
    from: {
      id: MOCK_PROFILE.id,
      username: MOCK_PROFILE.username,
      name: MOCK_PROFILE.name,
    },
    created_time: new Date(Date.now() - 3540000).toISOString(),
  },
  {
    id: "mock_msg_003",
    message: "میخوام رزرو کنم برای ۴ نفر",
    from: {
      id: "mock_user_002",
      username: "sara_ahmadi",
      name: "سارا احمدی",
    },
    created_time: new Date(Date.now() - 7200000).toISOString(), // 2 ساعت پیش
  },
  {
    id: "mock_msg_004",
    message: "آدرس رستوران کجاست؟",
    from: {
      id: "mock_user_003",
      username: "mohammad_karimi",
      name: "محمد کریمی",
    },
    created_time: new Date(Date.now() - 10800000).toISOString(), // 3 ساعت پیش
  },
  {
    id: "mock_msg_005",
    message: "ساعت کاری شما چیه؟",
    from: {
      id: "mock_user_004",
      username: "zahra_hosseini",
      name: "زهرا حسینی",
    },
    created_time: new Date(Date.now() - 14400000).toISOString(), // 4 ساعت پیش
  },
  {
    id: "mock_msg_006",
    message: "قیمت غذاها چقدره؟",
    from: {
      id: "mock_user_005",
      username: "reza_moradi",
      name: "رضا مرادی",
    },
    created_time: new Date(Date.now() - 18000000).toISOString(), // 5 ساعت پیش
  },
  {
    id: "mock_msg_007",
    message: "منو کامل",
    from: {
      id: "mock_user_006",
      username: "mina_safari",
      name: "مینا صفری",
    },
    created_time: new Date(Date.now() - 21600000).toISOString(), // 6 ساعت پیش
  },
  {
    id: "mock_msg_008",
    message: "سلام خوبید؟",
    from: {
      id: "mock_user_007",
      username: "hassan_jafari",
      name: "حسن جعفری",
    },
    created_time: new Date(Date.now() - 25200000).toISOString(), // 7 ساعت پیش
  },
];

// گفتگوهای تستی
export const MOCK_CONVERSATIONS: MockInstagramConversation[] = [
  {
    id: "mock_conv_001",
    updated_time: new Date(Date.now() - 3600000).toISOString(),
    messages: mockMessages.filter((m) => m.from.id === "mock_user_001" || m.from.id === MOCK_PROFILE.id),
  },
  {
    id: "mock_conv_002",
    updated_time: new Date(Date.now() - 7200000).toISOString(),
    messages: [mockMessages[2]],
  },
  {
    id: "mock_conv_003",
    updated_time: new Date(Date.now() - 10800000).toISOString(),
    messages: [mockMessages[3]],
  },
  {
    id: "mock_conv_004",
    updated_time: new Date(Date.now() - 14400000).toISOString(),
    messages: [mockMessages[4]],
  },
  {
    id: "mock_conv_005",
    updated_time: new Date(Date.now() - 18000000).toISOString(),
    messages: [mockMessages[5]],
  },
  {
    id: "mock_conv_006",
    updated_time: new Date(Date.now() - 21600000).toISOString(),
    messages: [mockMessages[6]],
  },
  {
    id: "mock_conv_007",
    updated_time: new Date(Date.now() - 25200000).toISOString(),
    messages: [mockMessages[7]],
  },
];

// Page Profile تستی برای Page Token mode
export const MOCK_PAGE_PROFILE = {
  id: "812762118592536",
  name: "شانشین رستوران - صفحه تستی",
  instagram_business_account: {
    id: MOCK_PROFILE.id,
    username: MOCK_PROFILE.username,
    name: MOCK_PROFILE.name,
  },
};

/**
 * ساخت پاسخ Mock برای API Test
 */
export function createMockApiTest(config: {
  key: string;
  title: string;
  endpoint: string;
  ok?: boolean;
  count?: number;
  message?: string;
}) {
  return {
    key: config.key,
    title: config.title,
    endpoint: `[MOCK] ${config.endpoint}`,
    ok: config.ok ?? true,
    status: 200,
    count: config.count,
    hasNext: false,
    message: config.message || "داده تستی Mock برگردانده شد.",
    hint: "این داده Mock است و از Meta API واقعی دریافت نشده.",
    sample: { mock: true },
    raw: { mock: true, mode: "local_testing" },
  };
}

/**
 * بررسی اینکه آیا Mock Mode فعال است
 */
export function isMockModeEnabled(): boolean {
  const mockEnv = process.env.INSTAFLOW_USE_MOCK_META || process.env.INSTAFLOW_META_MODE;
  return mockEnv === "true" || mockEnv === "mock" || mockEnv === "1";
}

/**
 * گرفتن تنظیمات Mock
 */
export function getMockSettings() {
  return {
    enabled: isMockModeEnabled(),
    profile: MOCK_PROFILE,
    pageProfile: MOCK_PAGE_PROFILE,
    conversationCount: MOCK_CONVERSATIONS.length,
    messageCount: mockMessages.length,
  };
}
