import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/auth";

const STATUSES = ["lead", "followup", "customer", "vip", "lost", "blocked"];

function clean(value: unknown) {
  return String(value || "").trim();
}

function normalizeStatus(value: unknown) {
  const status = clean(value);
  return STATUSES.includes(status) ? status : undefined;
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));

  const existing = await prisma.contact.findFirst({ where: { id, workspaceId: session.workspaceId } });
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const status = normalizeStatus(body.status);
  const leadScore = body.leadScore === undefined ? undefined : Math.max(0, Math.min(100, Number(body.leadScore || 0)));

  const lead = await prisma.contact.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: clean(body.name) || null } : {}),
      ...(body.username !== undefined ? { username: clean(body.username).replace(/^@+/, "") || null } : {}),
      ...(body.phone !== undefined ? { phone: clean(body.phone) || null } : {}),
      ...(status ? { status } : {}),
      ...(body.notes !== undefined ? { notes: clean(body.notes) || null } : {}),
      ...(leadScore !== undefined ? { leadScore } : {}),
      lastContactAt: new Date(),
    },
  });

  return NextResponse.json({ lead });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;

  const existing = await prisma.contact.findFirst({ where: { id, workspaceId: session.workspaceId } });
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await prisma.contact.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
