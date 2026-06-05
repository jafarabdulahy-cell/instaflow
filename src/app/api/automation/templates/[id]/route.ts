import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth";
import { deleteReplyTemplate } from "@/lib/v24-features";

type Params = { params: { id: string } };

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  await deleteReplyTemplate(session.workspaceId, params.id);
  return NextResponse.json({ ok: true });
}
