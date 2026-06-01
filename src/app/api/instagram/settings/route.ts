import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/auth";
import { clean, maskToken, verifyInstagramProfile } from "@/lib/instagram-api";

async function getActiveAccount(workspaceId: string) {
  return prisma.instagramAccount.findFirst({
    where: { workspaceId, isActive: true, NOT: { accessToken: "manual" } },
    orderBy: { connectedAt: "desc" },
  });
}

export async function GET(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const account = await getActiveAccount(session.workspaceId);
  if (!account) {
    return NextResponse.json({ configured: false, account: null });
  }

  return NextResponse.json({
    configured: Boolean(account.instagramId && account.accessToken),
    account: {
      id: account.id,
      instagramId: account.instagramId,
      username: account.username,
      name: account.name,
      tokenPreview: maskToken(account.accessToken),
      webhookStatus: account.webhookStatus,
      connectedAt: account.connectedAt,
      isActive: account.isActive,
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const instagramId = clean(body.instagramId);
  const accessToken = clean(body.accessToken);

  if (!instagramId || !accessToken) {
    return NextResponse.json({ error: "Instagram ID و Access Token الزامی است." }, { status: 400 });
  }

  let profile;
  try {
    profile = await verifyInstagramProfile({ instagramId, accessToken });
  } catch (error) {
    return NextResponse.json({ error: clean((error as Error).message) || "تست اتصال ناموفق بود." }, { status: 400 });
  }

  const username = clean(profile.username) || clean(body.username) || "instagram";
  const name = clean(profile.name) || clean(body.name) || username;

  await prisma.instagramAccount.updateMany({
    where: { workspaceId: session.workspaceId, instagramId: { not: instagramId } },
    data: { isActive: false },
  });

  const account = await prisma.instagramAccount.upsert({
    where: {
      workspaceId_instagramId: {
        workspaceId: session.workspaceId,
        instagramId,
      },
    },
    create: {
      workspaceId: session.workspaceId,
      instagramId,
      username,
      name,
      accessToken,
      webhookStatus: "pending",
      isActive: true,
      connectedAt: new Date(),
    },
    update: {
      username,
      name,
      accessToken,
      isActive: true,
      connectedAt: new Date(),
    },
  });

  return NextResponse.json({
    ok: true,
    profile,
    account: {
      id: account.id,
      instagramId: account.instagramId,
      username: account.username,
      name: account.name,
      tokenPreview: maskToken(account.accessToken),
      webhookStatus: account.webhookStatus,
      connectedAt: account.connectedAt,
    },
  });
}
