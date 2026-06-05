import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth";
import { deleteCommentAutomationRule } from "@/lib/v24-features";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, context: RouteContext) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  await deleteCommentAutomationRule(session.workspaceId, id);
  return NextResponse.json({ ok: true });
}
