import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth";
import { listAutomationLogs } from "@/lib/v24-features";

export async function GET(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const logs = await listAutomationLogs(session.workspaceId);
  return NextResponse.json({ ok: true, logs });
}
