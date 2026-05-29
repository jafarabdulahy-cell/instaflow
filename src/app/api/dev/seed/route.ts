import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const account = await prisma.instagramAccount.upsert({
    where: {
      workspaceId_instagramId: {
        workspaceId: session.workspaceId,
        instagramId: "demo-shanshin-ig",
      },
    },
    create: {
      workspaceId: session.workspaceId,
      instagramId: "demo-shanshin-ig",
      username: "shanshin_demo",
      name: "Shanshin Demo",
      accessToken: "demo-token-not-real",
      facebookPageId: "demo-page-id",
      facebookPageName: "Shanshin Demo Page",
      webhookStatus: "connected",
    },
    update: { isActive: true, webhookStatus: "connected" },
  });

  const samples = [
    { id: "u1001", name: "محمد احمدی", text: "سلام، قیمت رزرو جمعه چنده؟" },
    { id: "u1002", name: "سارا اکبری", text: "برای تولد ۲۰ نفره جا دارید؟" },
    { id: "u1003", name: "رضا کریمی", text: "منوی شام را می‌فرستید؟" },
  ];

  for (const s of samples) {
    const contact = await prisma.contact.upsert({
      where: { instagramAccountId_instagramUserId: { instagramAccountId: account.id, instagramUserId: s.id } },
      create: {
        workspaceId: session.workspaceId,
        instagramAccountId: account.id,
        instagramUserId: s.id,
        username: s.id,
        name: s.name,
        lastContactAt: new Date(),
      },
      update: { name: s.name, lastContactAt: new Date() },
    });

    const conversation = await prisma.conversation.upsert({
      where: { instagramAccountId_instagramUserId: { instagramAccountId: account.id, instagramUserId: s.id } },
      create: {
        workspaceId: session.workspaceId,
        instagramAccountId: account.id,
        contactId: contact.id,
        instagramUserId: s.id,
        username: s.id,
        displayName: s.name,
        lastMessage: s.text,
        unreadCount: 1,
      },
      update: { displayName: s.name, lastMessage: s.text, unreadCount: 1 },
    });

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        externalId: `demo-${s.id}-${Date.now()}`,
        direction: "inbound",
        senderId: s.id,
        text: s.text,
        rawPayload: { demo: true, source: "seed" },
      },
    });
  }

  return NextResponse.json({ ok: true, account: account.username, conversations: samples.length });
}
