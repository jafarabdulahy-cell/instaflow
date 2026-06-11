import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { normalizeRuleText } from "@/lib/auto-reply-rules";

export type AssetType = "image" | "video" | "audio" | "file" | "link";
export type MatchType = "equals" | "contains";

function clean(value: unknown) {
  return String(value || "").trim();
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

function toAssetType(value: unknown): AssetType {
  const text = clean(value).toLowerCase();
  if (["image", "video", "audio", "file", "link"].includes(text)) return text as AssetType;
  if (["عکس", "تصویر"].includes(text)) return "image";
  if (["ویدیو", "فیلم"].includes(text)) return "video";
  if (["صدا", "ویس"].includes(text)) return "audio";
  if (["فایل", "pdf", "پی دی اف"].includes(text)) return "file";
  return "link";
}

function toMatchType(value: unknown): MatchType {
  const text = clean(value).toLowerCase();
  return text === "contains" || text === "شامل" ? "contains" : "equals";
}

function ensureUrl(value: unknown) {
  const url = clean(value);
  if (!url) return "";
  return url;
}

export function assetTypeLabel(type: AssetType | string) {
  if (type === "image") return "عکس";
  if (type === "video") return "ویدیو";
  if (type === "audio") return "صدا";
  if (type === "file") return "فایل";
  return "لینک";
}

export type MediaAsset = {
  id: string;
  workspaceId: string;
  name: string;
  assetType: AssetType;
  url: string;
  description: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

type RawAssetRow = {
  id: string;
  workspace_id: string;
  name: string;
  asset_type: string;
  url: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
};

function rowToAsset(row: RawAssetRow): MediaAsset {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    assetType: toAssetType(row.asset_type),
    url: row.url,
    description: row.description || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function ensureAssetsTable() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS instaflow_media_assets (
        id TEXT PRIMARY KEY,
        workspace_id TEXT NOT NULL,
        name TEXT NOT NULL,
        asset_type TEXT NOT NULL DEFAULT 'link',
        url TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (e) {
    // جدول از قبل وجود دارد یا سینتکس با SQLite ناسازگار است
  }
  
  try {
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS instaflow_media_assets_workspace_idx ON instaflow_media_assets(workspace_id, created_at)`);
  } catch (e) {
    // ایندکس از قبل وجود دارد
  }
}

export async function listMediaAssets(workspaceId: string) {
  const id = clean(workspaceId);
  if (!id) return [];
  await ensureAssetsTable();
  const rows = await prisma.$queryRawUnsafe<RawAssetRow[]>(`SELECT * FROM instaflow_media_assets WHERE workspace_id=$1 ORDER BY created_at DESC`, id);
  return rows.map(rowToAsset);
}

export async function createMediaAsset(workspaceId: string, input: Record<string, unknown>) {
  const workspace = clean(workspaceId);
  if (!workspace) throw new Error("workspaceId نامعتبر است.");
  const name = clean(input.name) || "پیوست جدید";
  const assetType = toAssetType(input.assetType || input.type);
  const url = ensureUrl(input.url);
  const description = clean(input.description);
  if (!url) throw new Error("لینک فایل/رسانه الزامی است.");
  await ensureAssetsTable();
  const id = randomUUID();
  await prisma.$executeRawUnsafe(
    `INSERT INTO instaflow_media_assets (id, workspace_id, name, asset_type, url, description) VALUES ($1,$2,$3,$4,$5,$6)`,
    id,
    workspace,
    name.slice(0, 160),
    assetType,
    url.slice(0, 900),
    description.slice(0, 500) || null
  );
  return (await listMediaAssets(workspace)).find((item) => item.id === id) || null;
}

export async function deleteMediaAsset(workspaceId: string, assetId: string) {
  const workspace = clean(workspaceId);
  const id = clean(assetId);
  if (!workspace || !id) return false;
  await ensureAssetsTable();
  await prisma.$executeRawUnsafe(`DELETE FROM instaflow_media_assets WHERE workspace_id=$1 AND id=$2`, workspace, id);
  return true;
}


export type DirectCardButton = { label: string; url: string };

export type DirectCard = {
  id: string;
  workspaceId: string;
  name: string;
  title: string;
  description: string;
  imageUrl: string;
  price: string;
  buttons: DirectCardButton[];
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

type RawDirectCardRow = {
  id: string;
  workspace_id: string;
  name: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price: string | null;
  buttons: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

function safeButtons(value: unknown): DirectCardButton[] {
  const text = clean(value);
  let items: unknown[] = [];
  if (Array.isArray(value)) items = value;
  else if (text) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) items = parsed;
    } catch {
      items = [];
    }
  }
  return items
    .map((item) => {
      const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
      const label = clean(record.label || record.title || record.name);
      const url = ensureUrl(record.url || record.link || record.href);
      if (!label || !url) return null;
      return { label: label.slice(0, 80), url: url.slice(0, 900) };
    })
    .filter(Boolean)
    .slice(0, 6) as DirectCardButton[];
}

function rowToDirectCard(row: RawDirectCardRow): DirectCard {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    title: row.title,
    description: row.description || "",
    imageUrl: row.image_url || "",
    price: row.price || "",
    buttons: safeButtons(row.buttons),
    isActive: row.is_active !== false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function ensureDirectCardsTable() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS instaflow_direct_cards (
        id TEXT PRIMARY KEY,
        workspace_id TEXT NOT NULL,
        name TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        price TEXT,
        buttons TEXT NOT NULL DEFAULT '[]',
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (e) {
    // جدول از قبل وجود دارد یا سینتکس با SQLite ناسازگار است
  }
  
  try {
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS instaflow_direct_cards_workspace_idx ON instaflow_direct_cards(workspace_id, is_active, created_at)`);
  } catch (e) {
    // ایندکس از قبل وجود دارد
  }
}

export async function listDirectCards(workspaceId: string, options: { activeOnly?: boolean } = {}) {
  const workspace = clean(workspaceId);
  if (!workspace) return [];
  await ensureDirectCardsTable();
  const rows = await prisma.$queryRawUnsafe<RawDirectCardRow[]>(
    `SELECT * FROM instaflow_direct_cards WHERE workspace_id=$1 ${options.activeOnly ? "AND is_active = TRUE" : ""} ORDER BY created_at DESC`,
    workspace
  );
  return rows.map(rowToDirectCard);
}

export async function getDirectCard(workspaceId: string, cardId: string) {
  const workspace = clean(workspaceId);
  const id = clean(cardId);
  if (!workspace || !id) return null;
  await ensureDirectCardsTable();
  const rows = await prisma.$queryRawUnsafe<RawDirectCardRow[]>(`SELECT * FROM instaflow_direct_cards WHERE workspace_id=$1 AND id=$2 LIMIT 1`, workspace, id);
  return rows[0] ? rowToDirectCard(rows[0]) : null;
}

export async function createDirectCard(workspaceId: string, input: Record<string, unknown>) {
  const workspace = clean(workspaceId);
  if (!workspace) throw new Error("workspaceId نامعتبر است.");
  const title = clean(input.title) || "کارت جدید";
  const name = clean(input.name) || title;
  const description = clean(input.description);
  const imageUrl = ensureUrl(input.imageUrl || input.image || input.mediaUrl);
  const price = clean(input.price);
  const buttons = safeButtons(input.buttons);
  if (!title && !description && !imageUrl) throw new Error("عنوان، توضیح یا عکس کارت الزامی است.");
  await ensureDirectCardsTable();
  const id = randomUUID();
  await prisma.$executeRawUnsafe(
    `INSERT INTO instaflow_direct_cards (id, workspace_id, name, title, description, image_url, price, buttons, is_active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    id,
    workspace,
    name.slice(0, 140),
    title.slice(0, 160),
    description.slice(0, 700) || null,
    imageUrl.slice(0, 900) || null,
    price.slice(0, 80) || null,
    JSON.stringify(buttons),
    input.isActive !== false ? 1 : 0
  );
  return getDirectCard(workspace, id);
}

export async function deleteDirectCard(workspaceId: string, cardId: string) {
  const workspace = clean(workspaceId);
  const id = clean(cardId);
  if (!workspace || !id) return false;
  await ensureDirectCardsTable();
  await prisma.$executeRawUnsafe(`DELETE FROM instaflow_direct_cards WHERE workspace_id=$1 AND id=$2`, workspace, id);
  return true;
}

export function buildDirectCardText(card: DirectCard) {
  const lines: string[] = [];
  if (card.title) lines.push(`📌 ${card.title}`);
  if (card.description) lines.push(card.description);
  if (card.price) lines.push(`قیمت: ${card.price}`);
  if (card.imageUrl) lines.push(`عکس: ${card.imageUrl}`);
  for (const button of card.buttons || []) {
    lines.push(`${button.label}: ${button.url}`);
  }
  return lines.filter(Boolean).join("\n").slice(0, 1400);
}

export async function buildDirectCardTextById(workspaceId: string, cardId: string) {
  const card = await getDirectCard(workspaceId, cardId);
  return card && card.isActive ? buildDirectCardText(card) : "";
}

export type ReplyTemplate = {
  id: string;
  workspaceId: string;
  title: string;
  category: string;
  body: string;
  mediaType: AssetType | "none";
  mediaUrl: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

type RawTemplateRow = {
  id: string;
  workspace_id: string;
  title: string;
  category: string | null;
  body: string;
  media_type: string | null;
  media_url: string | null;
  created_at: Date;
  updated_at: Date;
};

async function ensureTemplatesTable() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS instaflow_reply_templates (
        id TEXT PRIMARY KEY,
        workspace_id TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT,
        body TEXT NOT NULL DEFAULT '',
        media_type TEXT NOT NULL DEFAULT 'none',
        media_url TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (e) {
    // جدول از قبل وجود دارد یا سینتکس با SQLite ناسازگار است
  }
  
  try {
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS instaflow_reply_templates_workspace_idx ON instaflow_reply_templates(workspace_id, created_at)`);
  } catch (e) {
    // ایندکس از قبل وجود دارد
  }
}

function rowToTemplate(row: RawTemplateRow): ReplyTemplate {
  const mediaUrl = row.media_url || "";
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    title: row.title,
    category: row.category || "عمومی",
    body: row.body || "",
    mediaType: mediaUrl ? toAssetType(row.media_type) : "none",
    mediaUrl,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listReplyTemplates(workspaceId: string) {
  const workspace = clean(workspaceId);
  if (!workspace) return [];
  await ensureTemplatesTable();
  const rows = await prisma.$queryRawUnsafe<RawTemplateRow[]>(`SELECT * FROM instaflow_reply_templates WHERE workspace_id=$1 ORDER BY created_at DESC`, workspace);
  return rows.map(rowToTemplate);
}

export async function createReplyTemplate(workspaceId: string, input: Record<string, unknown>) {
  const workspace = clean(workspaceId);
  if (!workspace) throw new Error("workspaceId نامعتبر است.");
  const title = clean(input.title) || "قالب جدید";
  const category = clean(input.category) || "عمومی";
  const body = clean(input.body);
  const mediaUrl = ensureUrl(input.mediaUrl);
  const mediaType = mediaUrl ? toAssetType(input.mediaType) : "none";
  if (!body && !mediaUrl) throw new Error("متن یا لینک رسانه برای قالب الزامی است.");
  await ensureTemplatesTable();
  const id = randomUUID();
  await prisma.$executeRawUnsafe(
    `INSERT INTO instaflow_reply_templates (id, workspace_id, title, category, body, media_type, media_url) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    id,
    workspace,
    title.slice(0, 160),
    category.slice(0, 80),
    body.slice(0, 1800),
    mediaType,
    mediaUrl.slice(0, 900) || null
  );
  return (await listReplyTemplates(workspace)).find((item) => item.id === id) || null;
}

export async function deleteReplyTemplate(workspaceId: string, templateId: string) {
  const workspace = clean(workspaceId);
  const id = clean(templateId);
  if (!workspace || !id) return false;
  await ensureTemplatesTable();
  await prisma.$executeRawUnsafe(`DELETE FROM instaflow_reply_templates WHERE workspace_id=$1 AND id=$2`, workspace, id);
  return true;
}

export type CommentAutomationRule = {
  id: string;
  workspaceId: string;
  name: string;
  triggers: string[];
  matchType: MatchType;
  publicReply: string;
  dmReply: string;
  isActive: boolean;
  sendDm: boolean;
  cardId: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

type RawCommentRuleRow = {
  id: string;
  workspace_id: string;
  name: string;
  triggers: string;
  match_type: string;
  public_reply: string | null;
  dm_reply: string | null;
  is_active: boolean;
  send_dm: boolean;
  card_id?: string | null;
  created_at: Date;
  updated_at: Date;
};

async function ensureCommentRulesTable() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS instaflow_comment_rules (
        id TEXT PRIMARY KEY,
        workspace_id TEXT NOT NULL,
        name TEXT NOT NULL,
        triggers TEXT NOT NULL DEFAULT '[]',
        match_type TEXT NOT NULL DEFAULT 'contains',
        public_reply TEXT,
        dm_reply TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        send_dm INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (e) {
    // جدول از قبل وجود دارد یا سینتکس با SQLite ناسازگار است
  }
  
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE instaflow_comment_rules ADD COLUMN card_id TEXT`);
  } catch (e) {
    // ستون از قبل وجود دارد
  }
  
  try {
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS instaflow_comment_rules_workspace_idx ON instaflow_comment_rules(workspace_id, is_active)`);
  } catch (e) {
    // ایندکس از قبل وجود دارد
  }
}

function rowToCommentRule(row: RawCommentRuleRow): CommentAutomationRule {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    triggers: safeJsonArray(row.triggers),
    matchType: toMatchType(row.match_type),
    publicReply: row.public_reply || "",
    dmReply: row.dm_reply || "",
    isActive: row.is_active !== false,
    sendDm: row.send_dm !== false,
    cardId: row.card_id || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listCommentAutomationRules(workspaceId: string, options: { activeOnly?: boolean } = {}) {
  const workspace = clean(workspaceId);
  if (!workspace) return [];
  await ensureCommentRulesTable();
  const rows = await prisma.$queryRawUnsafe<RawCommentRuleRow[]>(
    `SELECT * FROM instaflow_comment_rules WHERE workspace_id=$1 ${options.activeOnly ? "AND is_active = TRUE" : ""} ORDER BY created_at DESC`,
    workspace
  );
  return rows.map(rowToCommentRule);
}

export async function createCommentAutomationRule(workspaceId: string, input: Record<string, unknown>) {
  const workspace = clean(workspaceId);
  if (!workspace) throw new Error("workspaceId نامعتبر است.");
  const triggers = safeJsonArray(input.triggers).slice(0, 20);
  const name = clean(input.name) || (triggers[0] ? `کامنت ${triggers[0]}` : "قانون کامنت");
  const publicReply = clean(input.publicReply) || "سلام 🌹 دایرکت را بررسی کنید.";
  const dmReply = clean(input.dmReply);
  const cardId = clean(input.cardId);
  if (!triggers.length) throw new Error("حداقل یک کلمه کلیدی کامنت وارد کنید.");
  await ensureCommentRulesTable();
  const id = randomUUID();
  await prisma.$executeRawUnsafe(
    `INSERT INTO instaflow_comment_rules (id, workspace_id, name, triggers, match_type, public_reply, dm_reply, is_active, send_dm, card_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    id,
    workspace,
    name.slice(0, 160),
    JSON.stringify(triggers),
    toMatchType(input.matchType),
    publicReply.slice(0, 700),
    dmReply.slice(0, 1800),
    input.isActive !== false ? 1 : 0,
    input.sendDm !== false ? 1 : 0,
    cardId || null
  );
  return (await listCommentAutomationRules(workspace)).find((item) => item.id === id) || null;
}

export async function deleteCommentAutomationRule(workspaceId: string, ruleId: string) {
  const workspace = clean(workspaceId);
  const id = clean(ruleId);
  if (!workspace || !id) return false;
  await ensureCommentRulesTable();
  await prisma.$executeRawUnsafe(`DELETE FROM instaflow_comment_rules WHERE workspace_id=$1 AND id=$2`, workspace, id);
  return true;
}

function commentRuleMatches(rule: CommentAutomationRule, text: unknown) {
  const normalized = normalizeRuleText(text);
  if (!rule.isActive || !normalized) return false;
  return rule.triggers.some((trigger) => {
    const normalizedTrigger = normalizeRuleText(trigger);
    if (!normalizedTrigger) return false;
    if (rule.matchType === "equals") return normalized === normalizedTrigger;
    return normalized.includes(normalizedTrigger);
  });
}

export async function findMatchingCommentAutomationRule(workspaceId: string, text: unknown) {
  const rules = await listCommentAutomationRules(workspaceId, { activeOnly: true });
  return rules.find((rule) => commentRuleMatches(rule, text)) || null;
}

export function buildCommentRuleDmText(rule: CommentAutomationRule) {
  return clean(rule.dmReply) || clean(rule.publicReply) || `سلام 🌹 ${rule.name}`;
}

export async function buildCommentRuleDmTextForWorkspace(workspaceId: string, rule: CommentAutomationRule) {
  const base = buildCommentRuleDmText(rule);
  const cardText = rule.cardId ? await buildDirectCardTextById(workspaceId, rule.cardId) : "";
  return [base, cardText].filter(Boolean).join("\n\n").slice(0, 1900);
}

export async function listAutomationLogs(workspaceId: string) {
  const workspace = clean(workspaceId);
  if (!workspace) return [];
  const events = await prisma.webhookEvent.findMany({
    where: { workspaceId: workspace },
    orderBy: { createdAt: "desc" },
    take: 30,
  }).catch(() => []);
  return events.map((event) => ({
    id: event.id,
    type: event.eventType,
    processed: event.processed,
    createdAt: event.createdAt,
    senderId: event.senderId,
  }));
}
