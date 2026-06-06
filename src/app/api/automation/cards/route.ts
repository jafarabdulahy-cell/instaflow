import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth";
import { createDirectCard, listDirectCards } from "@/lib/v24-features";

export async function GET(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const cards = await listDirectCards(session.workspaceId);
  return NextResponse.json({ ok: true, cards });
}

export async function POST(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const body = await req.json().catch(() => ({}));
    const card = await createDirectCard(session.workspaceId, body);
    return NextResponse.json({ ok: true, card });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message || "ذخیره کارت ناموفق بود." }, { status: 400 });
  }
}
