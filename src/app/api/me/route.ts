import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ user: { id: session.userId, name: session.name, email: session.email, role: session.role }, workspaceId: session.workspaceId });
}
