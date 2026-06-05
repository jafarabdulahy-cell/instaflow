import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth";
import { buildAutoReplyDecision } from "@/lib/auto-reply";

export async function POST(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const decision = buildAutoReplyDecision({
    text: body.text,
    source: body.source || "instagram_dm",
  });

  return NextResponse.json({ ok: true, decision });
}
