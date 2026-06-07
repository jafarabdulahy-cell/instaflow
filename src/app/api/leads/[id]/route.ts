import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const contact = await prisma.contact.update({
    where: { id },
    data: {
      status: typeof body.status === "string" ? body.status : undefined,
      notes: typeof body.notes === "string" ? body.notes : undefined,
      phone: typeof body.phone === "string" ? body.phone : undefined,
      leadScore: Number.isFinite(Number(body.leadScore)) ? Number(body.leadScore) : undefined,
    },
  });
  if (contact.workspaceId !== session.workspaceId) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  return NextResponse.json({ ok: true, contact });
}
