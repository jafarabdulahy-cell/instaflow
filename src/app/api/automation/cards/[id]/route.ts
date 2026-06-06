import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth";
import { deleteDirectCard, getDirectCard } from "@/lib/v24-features";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const card = await getDirectCard(session.workspaceId, id);
  if (!card) return NextResponse.json({ ok: false, error: "کارت پیدا نشد." }, { status: 404 });
  return NextResponse.json({ ok: true, card });
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  await deleteDirectCard(session.workspaceId, id);
  return NextResponse.json({ ok: true });
}
