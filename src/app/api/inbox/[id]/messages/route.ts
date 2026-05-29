import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/auth";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;

  const conversation = await prisma.conversation.findFirst({
    where: { id, workspaceId: session.workspaceId },
    include: { contact: true, instagramAccount: { select: { username: true } } },
  });
  if (!conversation) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const messages = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
  });

  await prisma.conversation.update({ where: { id: conversation.id }, data: { unreadCount: 0 } });

  return NextResponse.json({ conversation, messages });
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const body = await req.json();
  const text = String(body.text || "").trim();
  if (!text) return NextResponse.json({ error: "متن پیام خالی است." }, { status: 400 });

  const conversation = await prisma.conversation.findFirst({ where: { id, workspaceId: session.workspaceId } });
  if (!conversation) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      direction: "outbound",
      senderId: session.userId,
      text,
      isRead: true,
    },
  });
  await prisma.conversation.update({ where: { id: conversation.id }, data: { lastMessage: text, unreadCount: 0 } });

  // ارسال واقعی به Instagram Graph API در فاز بعدی با محدودیت‌های Meta کامل می‌شود.
  return NextResponse.json({ message });
}
