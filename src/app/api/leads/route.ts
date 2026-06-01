import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/auth";

const STATUSES = ["all", "lead", "followup", "customer", "vip", "lost", "blocked"];

function clean(value: unknown) {
  return String(value || "").trim();
}

function normalizeStatus(value: unknown) {
  const status = clean(value) || "lead";
  return STATUSES.includes(status) && status !== "all" ? status : "lead";
}

async function getDefaultAccount(workspaceId: string) {
  const existing = await prisma.instagramAccount.findFirst({
    where: { workspaceId, isActive: true },
    orderBy: { connectedAt: "desc" },
  });

  if (existing) return existing;

  return prisma.instagramAccount.upsert({
    where: {
      workspaceId_instagramId: {
        workspaceId,
        instagramId: `manual-${workspaceId}`,
      },
    },
    create: {
      workspaceId,
      instagramId: `manual-${workspaceId}`,
      username: "manual_leads",
      name: "Manual Leads",
      accessToken: "manual",
      webhookStatus: "pending",
      isActive: true,
    },
    update: {},
  });
}

export async function GET(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status") || "all";

  const where = {
    workspaceId: session.workspaceId,
    ...(status !== "all" ? { status } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { username: { contains: q, mode: "insensitive" as const } },
            { phone: { contains: q, mode: "insensitive" as const } },
            { notes: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [leads, total, active, followup, customer, vip, lost] = await Promise.all([
    prisma.contact.findMany({
      where,
      include: {
        instagramAccount: { select: { username: true, name: true } },
        conversations: {
          select: { id: true, lastMessage: true, unreadCount: true, updatedAt: true },
          orderBy: { updatedAt: "desc" },
          take: 1,
        },
      },
      orderBy: [{ lastContactAt: "desc" }, { updatedAt: "desc" }],
      take: 80,
    }),
    prisma.contact.count({ where: { workspaceId: session.workspaceId } }),
    prisma.contact.count({ where: { workspaceId: session.workspaceId, status: { in: ["lead", "new", "followup", "vip"] } } }),
    prisma.contact.count({ where: { workspaceId: session.workspaceId, status: "followup" } }),
    prisma.contact.count({ where: { workspaceId: session.workspaceId, status: "customer" } }),
    prisma.contact.count({ where: { workspaceId: session.workspaceId, status: "vip" } }),
    prisma.contact.count({ where: { workspaceId: session.workspaceId, status: "lost" } }),
  ]);

  return NextResponse.json({ leads, stats: { total, active, followup, customer, vip, lost } });
}

export async function POST(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = clean(body.name);
  const username = clean(body.username).replace(/^@+/, "");
  const phone = clean(body.phone);
  const notes = clean(body.notes);
  const status = normalizeStatus(body.status);
  const leadScore = Math.max(0, Math.min(100, Number(body.leadScore || 0)));

  if (!name && !username && !phone) {
    return NextResponse.json({ error: "حداقل نام، شماره یا آی‌دی اینستاگرام را وارد کنید." }, { status: 400 });
  }

  const duplicate = await prisma.contact.findFirst({
    where: {
      workspaceId: session.workspaceId,
      OR: [
        ...(phone ? [{ phone }] : []),
        ...(username ? [{ username }] : []),
      ],
    },
  });

  if (duplicate) {
    const updated = await prisma.contact.update({
      where: { id: duplicate.id },
      data: {
        name: name || duplicate.name,
        username: username || duplicate.username,
        phone: phone || duplicate.phone,
        status,
        notes: notes || duplicate.notes,
        leadScore,
        lastContactAt: new Date(),
      },
    });
    return NextResponse.json({ lead: updated, updatedExisting: true });
  }

  const account = await getDefaultAccount(session.workspaceId);
  const manualKey = username || phone.replace(/\D/g, "") || `${Date.now()}`;

  const lead = await prisma.contact.create({
    data: {
      workspaceId: session.workspaceId,
      instagramAccountId: account.id,
      instagramUserId: `manual-${manualKey}-${Date.now()}`,
      username: username || null,
      name: name || username || phone,
      phone: phone || null,
      status,
      leadScore,
      notes: notes || null,
      firstContactAt: new Date(),
      lastContactAt: new Date(),
    },
  });

  return NextResponse.json({ lead }, { status: 201 });
}
