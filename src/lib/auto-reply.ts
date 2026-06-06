import { buildRuleResponseTextForWorkspace, findMatchingManualAutoReplyRule } from "@/lib/auto-reply-rules";
import { buildCommentRuleDmTextForWorkspace, findMatchingCommentAutomationRule } from "@/lib/v24-features";

export type AutoReplySource = "instagram_dm" | "instagram_comment" | "instagram_story_reply" | "instagram_interaction";

export type AutoReplyCategory =
  | "custom"
  | "menu"
  | "reservation"
  | "address"
  | "hours"
  | "price"
  | "phone"
  | "complaint"
  | "thanks"
  | "collaboration"
  | "unknown";

export type AutoReplyAction =
  | "dm_keyword_reply"
  | "comment_public_reply"
  | "comment_private_reply"
  | "story_reply"
  | "human_review";

export type AutoReplyDecision = {
  shouldReply: boolean;
  mode: "off" | "preview" | "live";
  liveSendAllowed: boolean;
  category: AutoReplyCategory;
  confidence: number;
  trigger: string;
  action: AutoReplyAction;
  responseText: string;
  publicCommentReply?: string;
  privateReplyText?: string;
  needsHumanReview: boolean;
  reason: string;
};

type Rule = {
  category: AutoReplyCategory;
  trigger: string;
  keywords: string[];
  confidence: number;
  dm: string;
  comment?: string;
  privateReply?: string;
  review?: boolean;
};

function clean(value: unknown) {
  return String(value || "").trim();
}

function env(name: string, fallback = "") {
  return clean(process.env[name]) || fallback;
}

function normalizeDigits(value: string) {
  const fa = "۰۱۲۳۴۵۶۷۸۹";
  const ar = "٠١٢٣٤٥٦٧٨٩";
  return value.replace(/[۰-۹٠-٩]/g, (char) => {
    const faIndex = fa.indexOf(char);
    if (faIndex >= 0) return String(faIndex);
    const arIndex = ar.indexOf(char);
    if (arIndex >= 0) return String(arIndex);
    return char;
  });
}

export function normalizeText(value: unknown) {
  return normalizeDigits(clean(value))
    .toLowerCase()
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/[\u200c\u200f\u202a-\u202e]/g, " ")
    .replace(/[.,!?؟،؛:;()\[\]{}<>"'`~*_+=|\\/\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function defaultMenuText() {
  return env(
    "INSTAFLOW_MENU_TEXT",
    "سلام 🌹 منوی شانشین آماده است. لطفاً برای دریافت منو یا رزرو، تعداد نفرات و ساعت حضورتان را بفرمایید."
  );
}

function defaultAddressText() {
  return env(
    "INSTAFLOW_ADDRESS_TEXT",
    "سلام 🌹 آدرس شانشین: بوکان، سه‌راه سنگینی. برای راهنمایی بیشتر پیام بدهید."
  );
}

function defaultHoursText() {
  return env(
    "INSTAFLOW_HOURS_TEXT",
    "سلام 🌹 شانشین همه‌روزه از ساعت ۱۱ تا ۱۲ شب آماده پذیرایی است."
  );
}

function defaultReservationText() {
  return env(
    "INSTAFLOW_RESERVATION_TEXT",
    "سلام، خوش آمدید 🌹 برای رزرو لطفاً تعداد نفرات، ساعت حضور و نامتان را بفرمایید تا همکاران بررسی کنند."
  );
}

function defaultPriceText() {
  return env(
    "INSTAFLOW_PRICE_TEXT",
    "سلام 🌹 لطفاً بفرمایید قیمت کدام غذا یا خدمات را می‌خواهید تا دقیق راهنمایی کنیم."
  );
}

function defaultPhoneText() {
  return env(
    "INSTAFLOW_PHONE_TEXT",
    "سلام 🌹 لطفاً شماره تماس خود را ارسال کنید تا همکاران شانشین سریع‌تر پیگیری کنند."
  );
}

function defaultUnknownText() {
  return env(
    "INSTAFLOW_UNKNOWN_REPLY_TEXT",
    "سلام، پیام شما دریافت شد 🌹 همکاران شانشین در اولین فرصت پاسخ می‌دهند."
  );
}

export function getAutoReplyMode(): "off" | "preview" | "live" {
  const mode = env("INSTAFLOW_AUTO_REPLY_MODE", "preview").toLowerCase();
  if (mode === "live") return "live";
  if (mode === "off") return "off";
  return "preview";
}

export function isLiveAutoReplyAllowed() {
  return getAutoReplyMode() === "live" && env("INSTAFLOW_ALLOW_LIVE_SEND").toLowerCase() === "true";
}

function buildRules(): Rule[] {
  return [
    {
      category: "menu",
      trigger: "منو",
      keywords: ["منو", "menu", "مینو", "لیست غذا", "غذاها", "فهرست غذا", "غذا", "خوراک", "کباب"],
      confidence: 95,
      dm: defaultMenuText(),
      comment: "سلام 🌹 منو را در دایرکت برایتان می‌فرستیم.",
      privateReply: defaultMenuText(),
    },
    {
      category: "reservation",
      trigger: "رزرو",
      keywords: ["رزرو", "جا دارید", "میز", "امشب جا", "نوبت", "book", "reservation", "رزرف"],
      confidence: 92,
      dm: defaultReservationText(),
      comment: "سلام 🌹 برای رزرو، جزئیات را در دایرکت بفرمایید.",
      privateReply: defaultReservationText(),
    },
    {
      category: "address",
      trigger: "آدرس",
      keywords: ["آدرس", "ادرس", "کجا", "لوکیشن", "location", "نشانی", "مسیر"],
      confidence: 90,
      dm: defaultAddressText(),
      comment: "سلام 🌹 آدرس و راهنمایی را در دایرکت می‌فرستیم.",
      privateReply: defaultAddressText(),
    },
    {
      category: "hours",
      trigger: "ساعت کاری",
      keywords: ["ساعت", "باز هستید", "بازین", "کی باز", "تا چند", "چند باز", "ساعت کاری", "open", "closed"],
      confidence: 88,
      dm: defaultHoursText(),
      comment: "سلام 🌹 ساعت کاری را در دایرکت ارسال کردیم.",
      privateReply: defaultHoursText(),
    },
    {
      category: "price",
      trigger: "قیمت",
      keywords: ["قیمت", "چنده", "چقدر", "هزینه", "price", "تعرفه", "نرخ"],
      confidence: 84,
      dm: defaultPriceText(),
      comment: "سلام 🌹 برای اعلام قیمت دقیق، لطفاً دایرکت را بررسی کنید.",
      privateReply: defaultPriceText(),
    },
    {
      category: "phone",
      trigger: "شماره تماس",
      keywords: ["شماره", "تماس", "تلفن", "زنگ", "call", "phone"],
      confidence: 82,
      dm: defaultPhoneText(),
      comment: "سلام 🌹 لطفاً شماره تماس را در دایرکت ارسال کنید.",
      privateReply: defaultPhoneText(),
    },
    {
      category: "complaint",
      trigger: "شکایت/نارضایتی",
      keywords: ["شکایت", "ناراضی", "بد بود", "مشکل", "اعتراض", "افتضاح", "complaint"],
      confidence: 86,
      dm: "سلام، بابت تجربه‌ای که داشتید متأسفیم. لطفاً شماره تماس و توضیح کوتاه بفرستید تا مدیریت مستقیم پیگیری کند.",
      comment: "سلام، پیام شما برای پیگیری مدیریت ثبت شد. لطفاً دایرکت را بررسی کنید.",
      privateReply: "سلام، بابت تجربه‌ای که داشتید متأسفیم. لطفاً شماره تماس و توضیح کوتاه بفرستید تا مدیریت مستقیم پیگیری کند.",
      review: true,
    },
    {
      category: "collaboration",
      trigger: "همکاری",
      keywords: ["همکاری", "تبلیغ", "بلاگر", "استخدام", "کار", "collab", "همکار"],
      confidence: 78,
      dm: "سلام 🌹 پیام همکاری شما دریافت شد. لطفاً موضوع همکاری، شماره تماس و نمونه کار را ارسال کنید تا بررسی شود.",
      comment: "سلام 🌹 لطفاً جزئیات همکاری را در دایرکت ارسال کنید.",
      privateReply: "سلام 🌹 پیام همکاری شما دریافت شد. لطفاً موضوع همکاری، شماره تماس و نمونه کار را ارسال کنید تا بررسی شود.",
    },
    {
      category: "thanks",
      trigger: "تشکر",
      keywords: ["ممنون", "مرسی", "تشکر", "سپاس", "عالی", "خوب بود", "thanks", "thank you"],
      confidence: 72,
      dm: "ممنون از پیام محبت‌آمیزتان 🌹 خوشحالیم که همراه شانشین هستید.",
      comment: "ممنون از محبت شما 🌹",
      privateReply: "ممنون از پیام محبت‌آمیزتان 🌹 خوشحالیم که همراه شانشین هستید.",
    },
  ];
}

function keywordMatched(text: string, keyword: string) {
  const normalizedKeyword = normalizeText(keyword);
  if (!normalizedKeyword) return false;
  return text === normalizedKeyword || text.includes(normalizedKeyword);
}

function findRule(text: string) {
  const normalized = normalizeText(text);
  if (!normalized) return null;
  return buildRules().find((rule) => rule.keywords.some((keyword) => keywordMatched(normalized, keyword))) || null;
}

function sourceAction(source: AutoReplySource, matched: boolean): AutoReplyAction {
  if (source === "instagram_comment") return matched ? "comment_private_reply" : "human_review";
  if (source === "instagram_story_reply") return matched ? "story_reply" : "human_review";
  if (source === "instagram_dm") return matched ? "dm_keyword_reply" : "human_review";
  return matched ? "dm_keyword_reply" : "human_review";
}

export function buildAutoReplyDecision(input: { text?: string | null; source?: AutoReplySource | string | null }): AutoReplyDecision {
  const source = (clean(input.source) || "instagram_dm") as AutoReplySource;
  const mode = getAutoReplyMode();
  const liveSendAllowed = isLiveAutoReplyAllowed();
  const text = clean(input.text);
  const rule = findRule(text);
  const matched = Boolean(rule);
  const category = rule?.category || "unknown";
  const action = sourceAction(source, matched);
  const shouldReply = mode !== "off" && (matched || env("INSTAFLOW_REPLY_UNKNOWN", "false").toLowerCase() === "true");
  const responseText = rule?.dm || defaultUnknownText();
  const publicCommentReply = source === "instagram_comment" ? (rule?.comment || "سلام 🌹 پیام شما دریافت شد. لطفاً دایرکت را بررسی کنید.") : undefined;
  const privateReplyText = source === "instagram_comment" ? (rule?.privateReply || responseText) : undefined;
  const needsHumanReview = Boolean(rule?.review) || !matched || mode !== "live" || !liveSendAllowed;

  return {
    shouldReply,
    mode,
    liveSendAllowed,
    category,
    confidence: rule?.confidence || 35,
    trigger: rule?.trigger || "نامشخص",
    action,
    responseText,
    publicCommentReply,
    privateReplyText,
    needsHumanReview,
    reason: matched
      ? `پیام با قانون «${rule?.trigger}» تشخیص داده شد.`
      : "قانون مطمئن پیدا نشد؛ بهتر است انسان بررسی کند.",
  };
}

export async function buildAutoReplyDecisionForWorkspace(input: {
  workspaceId?: string | null;
  text?: string | null;
  source?: AutoReplySource | string | null;
}): Promise<AutoReplyDecision> {
  const workspaceId = clean(input.workspaceId);
  if (!workspaceId) return buildAutoReplyDecision(input);

  const source = (clean(input.source) || "instagram_dm") as AutoReplySource;
  const mode = getAutoReplyMode();
  const liveSendAllowed = isLiveAutoReplyAllowed();
  if (source === "instagram_comment") {
    const commentRule = await findMatchingCommentAutomationRule(workspaceId, input.text).catch(() => null);
    if (commentRule) {
      const responseText = await buildCommentRuleDmTextForWorkspace(workspaceId, commentRule);
      const shouldReply = mode !== "off" && Boolean(responseText || commentRule.publicReply);
      return {
        shouldReply,
        mode,
        liveSendAllowed,
        category: "custom",
        confidence: 98,
        trigger: commentRule.triggers[0] || commentRule.name,
        action: "comment_private_reply",
        responseText,
        publicCommentReply: commentRule.publicReply || `سلام 🌹 ${commentRule.name} را در دایرکت ارسال کردیم.`,
        privateReplyText: commentRule.sendDm ? responseText : undefined,
        needsHumanReview: !shouldReply || mode !== "live" || !liveSendAllowed,
        reason: `کامنت با قانون دستی «${commentRule.name}» تشخیص داده شد.`,
      };
    }
  }

  const manualRule = await findMatchingManualAutoReplyRule(workspaceId, input.text);

  if (!manualRule) return buildAutoReplyDecision(input);

  const responseText = await buildRuleResponseTextForWorkspace(workspaceId, manualRule);
  const action = sourceAction(source, true);
  const shouldReply = mode !== "off" && Boolean(responseText);

  return {
    shouldReply,
    mode,
    liveSendAllowed,
    category: "custom",
    confidence: 98,
    trigger: manualRule.triggers[0] || manualRule.name,
    action,
    responseText,
    publicCommentReply: source === "instagram_comment" ? `سلام 🌹 ${manualRule.name} را در دایرکت ارسال کردیم.` : undefined,
    privateReplyText: source === "instagram_comment" ? responseText : undefined,
    needsHumanReview: !shouldReply || mode !== "live" || !liveSendAllowed,
    reason: `پیام با قانون دستی «${manualRule.name}» تشخیص داده شد.`,
  };
}

export function autoReplySummary(decision: AutoReplyDecision) {
  const parts = [
    `[AutoReply:${decision.category}]`,
    `mode=${decision.mode}`,
    `action=${decision.action}`,
    `confidence=${decision.confidence}`,
    `trigger=${decision.trigger}`,
  ];
  return parts.join(" | ");
}

export function listAutoReplyRules() {
  return buildRules().map((rule) => ({
    category: rule.category,
    trigger: rule.trigger,
    keywords: rule.keywords,
    confidence: rule.confidence,
    dm: rule.dm,
    comment: rule.comment,
    privateReply: rule.privateReply,
    review: Boolean(rule.review),
  }));
}
