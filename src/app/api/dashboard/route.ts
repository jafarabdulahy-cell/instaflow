import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [accounts, conversations, unread, webhookEvents] = await Promise.all([
    prisma.instagramAccount.findMany({ where: { workspaceId: session.workspaceId }, orderBy: { connectedAt: "desc" } }),
    prisma.conversation.count({ where: { workspaceId: session.workspaceId } }),
    prisma.conversation.aggregate({ where: { workspaceId: session.workspaceId }, _sum: { unreadCount: true } }),
    prisma.webhookEvent.count({ where: { workspaceId: session.workspaceId } }),
  ]);

  return NextResponse.json({
    stats: {
      accounts: accounts.length,
      conversations,
      unread: unread._sum.unreadCount || 0,
      webhookEvents,
      webhookStatus: accounts.some((a: { webhookStatus: string }) => a.webhookStatus === "connected") ? "connected" : "pending",
    },
    accounts,
  });
}
