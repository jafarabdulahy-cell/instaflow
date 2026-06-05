import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth";
import { getAutoReplyMode, isLiveAutoReplyAllowed, listAutoReplyRules } from "@/lib/auto-reply";
import { createManualAutoReplyRule, listManualAutoReplyRules } from "@/lib/auto-reply-rules";

export async function GET(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const manualRules = await listManualAutoReplyRules(session.workspaceId).catch(() => []);
  return NextResponse.json({
    ok: true,
    mode: getAutoReplyMode(),
    liveSendAllowed: isLiveAutoReplyAllowed(),
    rules: manualRules,
    fallbackRules: listAutoReplyRules(),
    source: manualRules.length ? "manual" : "fallback",
  });
}

export async function POST(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));
    const rule = await createManualAutoReplyRule(session.workspaceId, body);
    return NextResponse.json({ ok: true, rule });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message || "ذخیره قانون ناموفق بود." }, { status: 400 });
  }
}
