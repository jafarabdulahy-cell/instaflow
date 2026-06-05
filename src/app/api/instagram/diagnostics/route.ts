import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth";
import { clean, runInstagramDiagnostics } from "@/lib/instagram-api";
import { resolveInstagramConnection } from "@/lib/instagram-connection";

async function resolveInput(req: NextRequest, workspaceId: string) {
  const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
  const instagramId = clean(body.instagramId);
  const accessToken = clean(body.accessToken);
  const pageId = clean(body.pageId);
  const pageAccessToken = clean(body.pageAccessToken);
  if (instagramId && accessToken) return { instagramId, accessToken, pageId, pageAccessToken, source: "body" as const };

  const connection = await resolveInstagramConnection(workspaceId);
  if (!connection?.instagramId || !connection?.accessToken) return null;
  return {
    instagramId: connection.instagramId,
    accessToken: connection.accessToken,
    pageId: connection.pageId || "",
    pageAccessToken: connection.pageAccessToken || connection.accessToken,
    source: connection.source === "server_env" ? "server_env" as const : "saved" as const,
    mode: connection.mode,
  };
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
