import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth";
import { deleteManualAutoReplyRule, getManualAutoReplyRule, updateManualAutoReplyRule } from "@/lib/auto-reply-rules";

type Params = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Params) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const rule = await getManualAutoReplyRule(session.workspaceId, params.id);
  if (!rule) return NextResponse.json({ ok: false, error: "قانون پیدا نشد." }, { status: 404 });
  return NextResponse.json({ ok: true, rule });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const body = await req.json().catch(() => ({}));
    const rule = await updateManualAutoReplyRule(session.workspaceId, params.id, body);
    return NextResponse.json({ ok: true, rule });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message || "ویرایش قانون ناموفق بود." }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  await deleteManualAutoReplyRule(session.workspaceId, params.id);
  return NextResponse.json({ ok: true });
}
