import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth";
import { createMediaAsset, listMediaAssets } from "@/lib/v24-features";

export async function GET(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const assets = await listMediaAssets(session.workspaceId);
  return NextResponse.json({ ok: true, assets });
}

export async function POST(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const body = await req.json().catch(() => ({}));
    const asset = await createMediaAsset(session.workspaceId, body);
    return NextResponse.json({ ok: true, asset });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message || "ذخیره پیوست ناموفق بود." }, { status: 400 });
  }
}
