import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

export type ManualRuleMatchType = "equals" | "contains";
export type ManualRuleMediaType = "none" | "image" | "video" | "audio" | "file" | "link";

export type ManualRuleAttachment = { type: ManualRuleMediaType; url: string; label?: string };

export type ManualAutoReplyRule = {
  id: string;
  workspaceId: string;
  name: string;
  triggers: string[];
  matchType: ManualRuleMatchType;
  responseText: string;
  mediaType: ManualRuleMediaType;
  mediaUrl: string;
  attachments: ManualRuleAttachment[];
  isActive: boolean;
  sendOnce: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type CreateManualRuleInput = {
  name?: string;
  triggers?: string[] | string;
  matchType?: string;
  responseText?: string;
  mediaType?: string;
  mediaUrl?: string;
  attachments?: ManualRuleAttachment[] | string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  fileUrl?: string;
  isActive?: boolean;
  sendOnce?: boolean;
};

type RawRuleRow = {
  id: string;
  workspace_id: string;
  name: string;
  triggers: string;
  match_type: string;
  response_text: string;
  media_type: string | null;
  media_url: string | null;
  attachments?: string | null;
  is_active: boolean;
  send_once: boolean;
  created_at: Date;
  updated_at: Date;
};

function clean(value: unknown) {
  return String(value || "").trim();
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

export function normalizeRuleText(value: unknown) {
  return normalizeDigits(clean(value))
    .toLowerCase()
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/[\u200c\u200f\u202a-\u202e]/g, " ")
    .replace(/[.,!?؟،؛:;()\[\]{}<>"'`~*_+=|\\/\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function safeJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(clean).filter(Boolean);
  const text = clean(value);
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed.map(clean).filter(Boolean);
  } catch {
    // ignore
  }
  return text.split(/[،,\n]/).map(clean).filter(Boolean);
}


function safeAttachments(input: unknown): ManualRuleAttachment[] {
  const items: unknown[] = Array.isArray(input) ? input : (() => {
    const text = clean(input);
    if (!text) return [];
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  return items
    .map((item) => {
      const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
      const url = ensureUrl(record.url);
      if (!url) return null;
      return { type: toMediaType(record.type || record.mediaType), url, label: clean(record.label || record.name) || undefined };
    })
    .filter(Boolean)
    .slice(0, 8) as ManualRuleAttachment[];
}

function attachmentsFromInput(input: CreateManualRuleInput): ManualRuleAttachment[] {
  const base = safeAttachments(input.attachments);
  const extra: ManualRuleAttachment[] = [];
  const imageUrl = ensureUrl(input.imageUrl);
  const videoUrl = ensureUrl(input.videoUrl);
  const audioUrl = ensureUrl(input.audioUrl);
  const fileUrl = ensureUrl(input.fileUrl);
  if (imageUrl) extra.push({ type: "image", url: imageUrl, label: "عکس" });
  if (videoUrl) extra.push({ type: "video", url: videoUrl, label: "ویدیو" });
  if (audioUrl) extra.push({ type: "audio", url: audioUrl, label: "صدا" });
  if (fileUrl) extra.push({ type: "file", url: fileUrl, label: "فایل" });
  const seen = new Set<string>();
  return [...base, ...extra].filter((item) => {
    const key = `${item.type}:${item.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 8);
}

function toMatchType(value: unknown): ManualRuleMatchType {
  const text = clean(value).toLowerCase();
  return text === "contains" || text === "شامل" ? "contains" : "equals";
}

function toMediaType(value: unknown): ManualRuleMediaType {
  const text = clean(value).toLowerCase();
  if (["image", "video", "audio", "file", "link"].includes(text)) return text as ManualRuleMediaType;
  if (["عکس", "تصویر"].includes(text)) return "image";
  if (["ویدیو", "فیلم"].includes(text)) return "video";
  if (["صدا", "ویس"].includes(text)) return "audio";
  if (["فایل", "pdf", "پی دی اف"].includes(text)) return "file";
  if (["لینک", "url"].includes(text)) return "link";
  return "none";
}

function ensureUrl(value: unknown) {
  const url = clean(value);
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return url;
}

function rowToRule(row: RawRuleRow): ManualAutoReplyRule {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    triggers: safeJsonArray(row.triggers),
    matchType: toMatchType(row.match_type),
    responseText: row.response_text || "",
    mediaType: toMediaType(row.media_type),
    mediaUrl: row.media_url || "",
    attachments: safeAttachments(row.attachments),
    isActive: Boolean(row.is_active),
    sendOnce: row.send_once !== false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mediaLabel(type: ManualRuleMediaType) {
  if (type === "image") return "تصویر";
  if (type === "video") return "ویدیو";
  if (type === "audio") return "صدا";
  if (type === "file") return "فایل";
  if (type === "link") return "لینک";
  return "رسانه";
}

export function buildRuleResponseText(rule: Pick<ManualAutoReplyRule, "responseText" | "mediaType" | "mediaUrl" | "attachments">) {
  const text = clean(rule.responseText);
  const lines: string[] = [];
  const url = ensureUrl(rule.mediaUrl);
  if (url && rule.mediaType !== "none") lines.push(`${mediaLabel(rule.mediaType)}: ${url}`);
  for (const item of rule.attachments || []) {
    const itemUrl = ensureUrl(item.url);
    if (itemUrl) lines.push(`${item.label || mediaLabel(item.type)}: ${itemUrl}`);
  }
  return [text, ...lines].filter(Boolean).join("\n\n").slice(0, 1900);
}

async function ensureRulesTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS instaflow_auto_reply_rules (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      name TEXT NOT NULL,
      triggers TEXT NOT NULL DEFAULT '[]',
      match_type TEXT NOT NULL DEFAULT 'equals',
      response_text TEXT NOT NULL DEFAULT '',
      media_type TEXT NOT NULL DEFAULT 'none',
      media_url TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      send_once BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await prisma.$executeRawUnsafe(`ALTER TABLE instaflow_auto_reply_rules ADD COLUMN IF NOT EXISTS attachments TEXT NOT NULL DEFAULT '[]'`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS instaflow_auto_reply_rules_workspace_idx ON instaflow_auto_reply_rules(workspace_id, is_active)`);
}

export function sanitizeRuleInput(input: CreateManualRuleInput) {
  const triggers = safeJsonArray(input.triggers).slice(0, 20);
  const name = clean(input.name) || (triggers[0] ? `قانون ${triggers[0]}` : "قانون جدید");
  const responseText = clean(input.responseText);
  const mediaType = toMediaType(input.mediaType);
  const mediaUrl = ensureUrl(input.mediaUrl);
  const attachments = attachmentsFromInput(input);

  if (!triggers.length) throw new Error("حداقل یک کلمه کلیدی/فعال‌کننده وارد کنید.");
  if (!responseText && !mediaUrl && !attachments.length) throw new Error("متن پاسخ یا لینک رسانه/فایل الزامی است.");

  return {
    name: name.slice(0, 140),
    triggers,
    matchType: toMatchType(input.matchType),
    responseText: responseText.slice(0, 1800),
    mediaType: mediaUrl ? mediaType === "none" ? "link" : mediaType : "none",
    mediaUrl: mediaUrl.slice(0, 700),
    attachments,
    isActive: input.isActive !== false,
    sendOnce: input.sendOnce !== false,
  };
}

export async function listManualAutoReplyRules(workspaceId: string, options: { activeOnly?: boolean } = {}) {
  const id = clean(workspaceId);
  if (!id) return [];
  await ensureRulesTable();
  const rows = await prisma.$queryRawUnsafe<RawRuleRow[]>(
    `SELECT * FROM instaflow_auto_reply_rules WHERE workspace_id = $1 ${options.activeOnly ? "AND is_active = TRUE" : ""} ORDER BY created_at DESC`,
    id
  );
  return rows.map(rowToRule);
}

export async function getManualAutoReplyRule(workspaceId: string, ruleId: string) {
  const id = clean(workspaceId);
  const rid = clean(ruleId);
  if (!id || !rid) return null;
  await ensureRulesTable();
  const rows = await prisma.$queryRawUnsafe<RawRuleRow[]>(
    `SELECT * FROM instaflow_auto_reply_rules WHERE workspace_id = $1 AND id = $2 LIMIT 1`,
    id,
    rid
  );
  return rows[0] ? rowToRule(rows[0]) : null;
}

export async function createManualAutoReplyRule(workspaceId: string, input: CreateManualRuleInput) {
  const id = clean(workspaceId);
  if (!id) throw new Error("workspaceId نامعتبر است.");
  const data = sanitizeRuleInput(input);
  const ruleId = randomUUID();
  await ensureRulesTable();
  await prisma.$executeRawUnsafe(
    `INSERT INTO instaflow_auto_reply_rules (id, workspace_id, name, triggers, match_type, response_text, media_type, media_url, attachments, is_active, send_once)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    ruleId,
    id,
    data.name,
    JSON.stringify(data.triggers),
    data.matchType,
    data.responseText,
    data.mediaType,
    data.mediaUrl || null,
    JSON.stringify(data.attachments),
    data.isActive,
    data.sendOnce
  );
  const created = await getManualAutoReplyRule(id, ruleId);
  if (!created) throw new Error("قانون ذخیره شد اما دوباره خوانده نشد.");
  return created;
}

export async function updateManualAutoReplyRule(workspaceId: string, ruleId: string, input: CreateManualRuleInput) {
  const id = clean(workspaceId);
  const rid = clean(ruleId);
  if (!id || !rid) throw new Error("شناسه قانون نامعتبر است.");
  const data = sanitizeRuleInput(input);
  await ensureRulesTable();
  await prisma.$executeRawUnsafe(
    `UPDATE instaflow_auto_reply_rules
     SET name=$3, triggers=$4, match_type=$5, response_text=$6, media_type=$7, media_url=$8, attachments=$9, is_active=$10, send_once=$11, updated_at=NOW()
     WHERE workspace_id=$1 AND id=$2`,
    id,
    rid,
    data.name,
    JSON.stringify(data.triggers),
    data.matchType,
    data.responseText,
    data.mediaType,
    data.mediaUrl || null,
    JSON.stringify(data.attachments),
    data.isActive,
    data.sendOnce
  );
  return getManualAutoReplyRule(id, rid);
}

export async function deleteManualAutoReplyRule(workspaceId: string, ruleId: string) {
  const id = clean(workspaceId);
  const rid = clean(ruleId);
  if (!id || !rid) throw new Error("شناسه قانون نامعتبر است.");
  await ensureRulesTable();
  await prisma.$executeRawUnsafe(`DELETE FROM instaflow_auto_reply_rules WHERE workspace_id=$1 AND id=$2`, id, rid);
  return true;
}

function ruleMatches(rule: ManualAutoReplyRule, normalizedText: string) {
  if (!rule.isActive || !normalizedText) return false;
  return rule.triggers.some((trigger) => {
    const normalizedTrigger = normalizeRuleText(trigger);
    if (!normalizedTrigger) return false;
    if (rule.matchType === "contains") return normalizedText.includes(normalizedTrigger);
    return normalizedText === normalizedTrigger;
  });
}

export async function findMatchingManualAutoReplyRule(workspaceId: string, text: unknown) {
  const normalized = normalizeRuleText(text);
  if (!normalized) return null;
  const rules = await listManualAutoReplyRules(workspaceId, { activeOnly: true });
  return rules.find((rule) => ruleMatches(rule, normalized)) || null;
}
