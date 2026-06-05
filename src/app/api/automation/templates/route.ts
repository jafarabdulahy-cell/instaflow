import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth";
import { createReplyTemplate, listReplyTemplates } from "@/lib/v24-features";

export async function GET(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const templates = await listReplyTemplates(session.workspaceId);
  return NextResponse.json({ ok: true, templates });
}

export async function POST(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const body = await req.json().catch(() => ({}));
    const template = await createReplyTemplate(session.workspaceId, body);
    return NextResponse.json({ ok: true, template });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message || "ذخیره قالب ناموفق بود." }, { status: 400 });
  }
}
