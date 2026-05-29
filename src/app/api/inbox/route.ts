import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const filter = searchParams.get("filter") || "all";

  const conversations = await prisma.conversation.findMany({
    where: {
      workspaceId: session.workspaceId,
      ...(q ? { OR: [
        { displayName: { contains: q, mode: "insensitive" } },
        { username: { contains: q, mode: "insensitive" } },
        { lastMessage: { contains: q, mode: "insensitive" } },
      ] } : {}),
      ...(filter === "unread" ? { unreadCount: { gt: 0 } } : {}),
      ...(filter === "vip" ? { isVip: true } : {}),
    },
    include: { instagramAccount: { select: { username: true } }, contact: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ conversations });
}
