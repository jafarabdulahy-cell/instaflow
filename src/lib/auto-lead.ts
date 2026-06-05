import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { autoReplySummary, buildAutoReplyDecision } from "@/lib/auto-reply";

type ConnectedAccount = {
  id: string;
  workspaceId: string;
  username: string;
};

export type AutoLeadSource = "instagram_dm" | "instagram_comment" | "instagram_story_reply" | "instagram_interaction";

export type CaptureAutoLeadInput = {
  account: ConnectedAccount;
  instagramUserId: string;
  username?: string | null;
  displayName?: string | null;
  text?: string | null;
  source: AutoLeadSource;
  externalId?: string | null;
  rawPayload?: unknown;
};

const SOURCE_LABELS: Record<AutoLeadSource, string> = {
  instagram_dm: "دایرکت اینستاگرام",
  instagram_comment: "کامنت اینستاگرام",
  instagram_story_reply: "ریپلای استوری",
  instagram_interaction: "تعامل اینستاگرام",
};

const SOURCE_SCORES: Record<AutoLeadSource, number> = {
  instagram_dm: 18,
  instagram_comment: 10,
  instagram_story_reply: 22,
  instagram_interaction: 8,
};

function clean(value?: string | null) {
  return String(value || "").trim();
}

function toInputJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? {})) as Prisma.InputJsonValue;
}

function sourceTag(source: AutoLeadSource) {
  return `[AutoLead:${source}]`;
}

function mergeNotes(notes: string | null | undefined, source: AutoLeadSource, text?: string | null, autoReplyLine?: string) {
  const current = clean(notes);
  const tag = sourceTag(source);
  const label = SOURCE_LABELS[source];
  const shortText = clean(text).slice(0, 140);
  const leadLine = `${tag} منبع خودکار: ${label}${shortText ? ` | آخرین تعامل: ${shortText}` : ""}`;
  const replyLine = clean(autoReplyLine);
  const lines = [leadLine, replyLine].filter(Boolean);

  if (!current) return lines.join("\n").slice(0, 1200);

  const nextLines = [...lines];
  if (current.includes(tag)) nextLines.shift();
  if (replyLine && current.includes(replyLine)) nextLines.pop();
  if (!nextLines.length) return current;
  return `${current}\n${nextLines.join("\n")}`.slice(0, 1200);
}

function nextStatus(status?: string | null) {
  // وضعیت‌هایی که کاربر دستی تعیین کرده را خراب نکن.
  if (["customer", "vip", "lost", "blocked"].includes(status || "")) return status || "lead";
  return "lead";
}

export function detectLeadSource(notes?: string | null) {
  const value = notes || "";
  if (value.includes(sourceTag("instagram_story_reply"))) return "story";
  if (value.includes(sourceTag("instagram_comment"))) return "comment";
  if (value.includes(sourceTag("instagram_dm"))) return "dm";
  if (value.includes("[AutoLead:")) return "instagram";
  return "manual";
}

export async function captureAutoLead(input: CaptureAutoLeadInput) {
  const instagramUserId = clean(input.instagramUserId);
  if (!instagramUserId) return null;

  const username = clean(input.username).replace(/^@+/, "") || instagramUserId;
  const displayName = clean(input.displayName) || username;
  const text = clean(input.text) || "تعامل جدید اینستاگرام";
  const scoreDelta = SOURCE_SCORES[input.source] || 8;
  const autoReply = buildAutoReplyDecision({ text, source: input.source });
  const autoReplyLine = autoReplySummary(autoReply);
  const now = new Date();

  const existingContact = await prisma.contact.findUnique({
    where: {
      instagramAccountId_instagramUserId: {
        instagramAccountId: input.account.id,
        instagramUserId,
      },
    },
  });

  const contact = existingContact
    ? await prisma.contact.update({
        where: { id: existingContact.id },
        data: {
          username: username || existingContact.username,
          name: displayName || existingContact.name,
          status: nextStatus(existingContact.status),
          notes: mergeNotes(existingContact.notes, input.source, text, autoReplyLine),
          leadScore: Math.min(100, (existingContact.leadScore || 0) + scoreDelta),
          lastContactAt: now,
        },
      })
    : await prisma.contact.create({
        data: {
          workspaceId: input.account.workspaceId,
          instagramAccountId: input.account.id,
          instagramUserId,
          username,
          name: displayName,
          status: "lead",
          leadScore: Math.min(100, scoreDelta),
          notes: mergeNotes(null, input.source, text, autoReplyLine),
          firstContactAt: now,
          lastContactAt: now,
        },
      });

  const previousConversation = await prisma.conversation.findUnique({
    where: {
      instagramAccountId_instagramUserId: {
        instagramAccountId: input.account.id,
        instagramUserId,
      },
    },
  });

  if (previousConversation && input.externalId) {
    const duplicateMessage = await prisma.message.findFirst({
      where: { conversationId: previousConversation.id, externalId: input.externalId },
      select: { id: true },
    });
    if (duplicateMessage) return { contact, conversation: previousConversation, duplicated: true };
  }

  const conversation = await prisma.conversation.upsert({
    where: {
      instagramAccountId_instagramUserId: {
        instagramAccountId: input.account.id,
        instagramUserId,
      },
    },
    create: {
      workspaceId: input.account.workspaceId,
      instagramAccountId: input.account.id,
      contactId: contact.id,
      instagramUserId,
      username,
      displayName,
      lastMessage: text,
      unreadCount: 1,
      status: "open",
      isVip: contact.status === "vip",
    },
    update: {
      contactId: contact.id,
      username,
      displayName,
      lastMessage: text,
      unreadCount: { increment: 1 },
      status: "open",
      isVip: contact.status === "vip",
      updatedAt: now,
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      externalId: input.externalId || undefined,
      direction: "inbound",
      senderId: instagramUserId,
      text,
      rawPayload: toInputJson({ source: input.source, autoReply, payload: input.rawPayload }),
    },
  });

  return { contact, conversation, duplicated: false };
}
