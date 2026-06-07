import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [accounts, conversations, contacts, webhookEvents] = await Promise.all([
    prisma.instagramAccount.findMany({ where: { workspaceId: session.workspaceId }, orderBy: { connectedAt: "desc" } }),
    prisma.conversation.findMany({ where: { workspaceId: session.workspaceId }, select: { unreadCount: true } }),
    prisma.contact.findMany({ where: { workspaceId: session.workspaceId }, select: { status: true } }),
    prisma.webhookEvent.count({ where: { workspaceId: session.workspaceId } }).catch(() => 0),
  ]);

  const unread = conversations.reduce((sum, item) => sum + (item.unreadCount || 0), 0);
  const customers = contacts.filter((item) => item.status === "customer" || item.status === "vip").length;
  const leads = contacts.filter((item) => item.status !== "blocked").length;
  const webhookStatus = accounts.some((account) => account.webhookStatus === "connected" || account.webhookStatus === "page_token" || account.webhookStatus === "server_env") ? "connected" : "pending";

  return NextResponse.json({
    stats: { accounts: accounts.length, conversations: conversations.length, unread, webhookEvents, leads, customers, followups: 0, webhookStatus },
    accounts: accounts.map((account) => ({
      id: account.id,
      username: account.username,
      name: account.name || undefined,
      profilePicUrl: account.profilePicUrl || undefined,
      webhookStatus: account.webhookStatus,
      followersCount: account.followersCount,
    })),
  });
}
