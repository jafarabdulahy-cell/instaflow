import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth";
import { createCommentAutomationRule, listCommentAutomationRules } from "@/lib/v24-features";

export async function GET(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const rules = await listCommentAutomationRules(session.workspaceId);
  return NextResponse.json({ ok: true, rules });
}

export async function POST(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const body = await req.json().catch(() => ({}));
    const rule = await createCommentAutomationRule(session.workspaceId, body);
    return NextResponse.json({ ok: true, rule });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message || "ذخیره قانون کامنت ناموفق بود." }, { status: 400 });
  }
}
