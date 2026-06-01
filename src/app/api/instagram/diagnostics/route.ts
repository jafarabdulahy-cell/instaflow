import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/auth";
import { clean, runInstagramDiagnostics } from "@/lib/instagram-api";

async function activeAccount(workspaceId: string) {
  return prisma.instagramAccount.findFirst({
    where: { workspaceId, isActive: true, NOT: { accessToken: "manual" } },
    orderBy: { connectedAt: "desc" },
  });
}

async function resolveInput(req: NextRequest, workspaceId: string) {
  const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
  const instagramId = clean(body.instagramId);
  const accessToken = clean(body.accessToken);
  if (instagramId && accessToken) return { instagramId, accessToken, source: "body" as const };

  const account = await activeAccount(workspaceId);
  if (!account?.instagramId || !account?.accessToken) return null;
  return { instagramId: account.instagramId, accessToken: account.accessToken, source: "saved" as const };
}

export async function GET(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const input = await resolveInput(req, session.workspaceId);
  if (!input) return NextResponse.json({ error: "هیچ اتصال فعالی برای اینستاگرام ذخیره نشده است." }, { status: 400 });

  const result = await runInstagramDiagnostics(input);
  return NextResponse.json({ ...result, source: input.source });
}

export async function POST(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const input = await resolveInput(req, session.workspaceId);
  if (!input) return NextResponse.json({ error: "Instagram ID و Token را وارد یا ذخیره کنید." }, { status: 400 });

  const result = await runInstagramDiagnostics(input);
  return NextResponse.json({ ...result, source: input.source });
}
