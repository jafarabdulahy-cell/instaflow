import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/auth";

const META_APP_ID = process.env.META_APP_ID || "";
const META_APP_SECRET = process.env.META_APP_SECRET || "";

export async function GET(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.redirect(new URL("/auth/login?next=/connect", req.url));

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) return NextResponse.redirect(new URL("/connect?error=access_denied", req.url));
  if (!code) return NextResponse.redirect(new URL("/connect?error=no_code", req.url));

  try {
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/instagram/callback`;
    const tokenRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${META_APP_ID}&client_secret=${META_APP_SECRET}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`
    );
    const tokenData = await tokenRes.json();
    if (tokenData.error || !tokenData.access_token) {
      return NextResponse.redirect(new URL("/connect?error=token_exchange", req.url));
    }

    const longRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${META_APP_ID}&client_secret=${META_APP_SECRET}&fb_exchange_token=${tokenData.access_token}`
    );
    const longData = await longRes.json();
    const longToken = longData.access_token || tokenData.access_token;

    const pagesRes = await fetch(`https://graph.facebook.com/v21.0/me/accounts?access_token=${longToken}`);
    const pagesData = await pagesRes.json();
    if (!pagesData.data?.length) return NextResponse.redirect(new URL("/connect?error=no_pages", req.url));

    let instagramAccount: Record<string, string | number | null> | null = null;
    let linkedPage: Record<string, string> | null = null;

    for (const page of pagesData.data) {
      const igRes = await fetch(
        `https://graph.facebook.com/v21.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
      );
      const igData = await igRes.json();
      if (!igData.instagram_business_account) continue;

      const igId = igData.instagram_business_account.id;
      const profileRes = await fetch(
        `https://graph.facebook.com/v21.0/${igId}?fields=id,username,name,profile_picture_url,followers_count,biography&access_token=${page.access_token}`
      );
      const profile = await profileRes.json();
      instagramAccount = { ...profile, pageToken: page.access_token };
      linkedPage = page;
      break;
    }

    if (!instagramAccount || !linkedPage) {
      return NextResponse.redirect(new URL("/connect?error=no_instagram", req.url));
    }

    await prisma.instagramAccount.upsert({
      where: {
        workspaceId_instagramId: {
          workspaceId: session.workspaceId,
          instagramId: String(instagramAccount.id),
        },
      },
      create: {
        workspaceId: session.workspaceId,
        instagramId: String(instagramAccount.id),
        username: String(instagramAccount.username),
        name: instagramAccount.name ? String(instagramAccount.name) : null,
        profilePicUrl: instagramAccount.profile_picture_url ? String(instagramAccount.profile_picture_url) : null,
        followersCount: Number(instagramAccount.followers_count || 0),
        biography: instagramAccount.biography ? String(instagramAccount.biography) : null,
        accessToken: String(instagramAccount.pageToken),
        tokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 55),
        facebookPageId: linkedPage.id,
        facebookPageName: linkedPage.name,
        webhookStatus: "connected",
      },
      update: {
        username: String(instagramAccount.username),
        name: instagramAccount.name ? String(instagramAccount.name) : null,
        profilePicUrl: instagramAccount.profile_picture_url ? String(instagramAccount.profile_picture_url) : null,
        followersCount: Number(instagramAccount.followers_count || 0),
        biography: instagramAccount.biography ? String(instagramAccount.biography) : null,
        accessToken: String(instagramAccount.pageToken),
        tokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 55),
        facebookPageId: linkedPage.id,
        facebookPageName: linkedPage.name,
        webhookStatus: "connected",
        isActive: true,
      },
    });

    await registerWebhook(String(instagramAccount.pageToken), linkedPage.id);
    return NextResponse.redirect(new URL(`/dashboard?connected=${instagramAccount.username}`, req.url));
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(new URL("/connect?error=server_error", req.url));
  }
}

async function registerWebhook(pageToken: string, pageId: string) {
  await fetch(`https://graph.facebook.com/v21.0/${pageId}/subscribed_apps`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subscribed_fields: ["messages", "messaging_postbacks", "comments", "mention", "follows"],
      access_token: pageToken,
    }),
  }).catch((err) => console.error("Webhook registration error:", err));
}
