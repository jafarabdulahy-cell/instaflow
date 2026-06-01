import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/auth";
import { clean, maskToken, verifyInstagramProfile } from "@/lib/instagram-api";
import { resolveInstagramConnection } from "@/lib/instagram-connection";

export async function GET(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const connection = await resolveInstagramConnection(session.workspaceId);
  if (!connection) {
    return NextResponse.json({ configured: false, account: null, source: null });
  }

  const account = connection.account;

  return NextResponse.json({
    configured: Boolean(connection.instagramId && connection.accessToken),
    source: connection.source,
    account: {
      id: account?.id || "server-env",
      instagramId: connection.instagramId,
      username: account?.username || connection.username,
      name: account?.name || connection.name,
      tokenPreview: connection.tokenPreview,
      webhookStatus: account?.webhookStatus || "server_env",
      connectedAt: account?.connectedAt || null,
      isActive: account?.isActive ?? true,
      tokenStorage: connection.source === "server_env" ? "server_env" : "database",
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
