import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";

/**
 * اتصال نهایی پیج انتخاب شده
 */
export async function POST(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { pageId } = body;

    if (!pageId) {
      return NextResponse.json({ error: "pageId is required" }, { status: 400 });
    }

    // دریافت OAuth session
    const oauthSession = await prisma.oAuthSession.findFirst({
      where: {
        workspaceId: session.workspaceId,
        userId: session.userId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!oauthSession) {
      return NextResponse.json(
        { error: "OAuth session not found or expired" },
        { status: 404 }
      );
    }

    const pages = JSON.parse(oauthSession.pages);
    const selectedPage = pages.find((p: any) => p.id === pageId);

    if (!selectedPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    if (!selectedPage.instagram_business_account) {
      return NextResponse.json(
        { error: "این صفحه به Instagram Business متصل نیست" },
        { status: 400 }
      );
    }

    const pageAccessToken = selectedPage.access_token;
    const instagramBusinessAccountId = selectedPage.instagram_business_account.id;

    // دریافت اطلاعات Instagram
    const igProfileResponse = await fetch(
      `https://graph.facebook.com/v21.0/${instagramBusinessAccountId}?fields=id,username,name,profile_picture_url,followers_count,biography&access_token=${pageAccessToken}`
    );

    if (!igProfileResponse.ok) {
      throw new Error("دریافت اطلاعات Instagram ناموفق بود");
    }

    const igProfile = await igProfileResponse.json();

    // تبدیل به Long-Lived Token (60 روز)
    const longLivedTokenResponse = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?${new URLSearchParams({
        grant_type: "fb_exchange_token",
        client_id: process.env.META_APP_ID || "",
        client_secret: process.env.META_APP_SECRET || "",
        fb_exchange_token: pageAccessToken,
      })}`
    );

    let finalToken = pageAccessToken;
    let tokenExpiresAt = null;

    if (longLivedTokenResponse.ok) {
      const longLivedData = await longLivedTokenResponse.json();
      if (longLivedData.access_token) {
        finalToken = longLivedData.access_token;
        // Long-lived tokens معمولاً 60 روز اعتبار دارند
        tokenExpiresAt = new Date(
          Date.now() + (longLivedData.expires_in || 5184000) * 1000
        );
      }
    }

    // غیرفعال کردن اکانت‌های قبلی
    await prisma.instagramAccount.updateMany({
      where: {
        workspaceId: session.workspaceId,
        instagramId: { not: igProfile.id },
      },
      data: { isActive: false },
    });

    // ذخیره یا بروزرسانی اکانت
    const account = await prisma.instagramAccount.upsert({
      where: {
        workspaceId_instagramId: {
          workspaceId: session.workspaceId,
          instagramId: igProfile.id,
        },
      },
      create: {
        workspaceId: session.workspaceId,
        instagramId: igProfile.id,
        username: igProfile.username || "instagram",
        name: igProfile.name || igProfile.username || "Instagram User",
        profilePicUrl: igProfile.profile_picture_url || null,
        followersCount: igProfile.followers_count || 0,
        biography: igProfile.biography || null,
        accessToken: encrypt(finalToken),
        tokenExpiresAt,
        facebookPageId: selectedPage.id,
        facebookPageName: selectedPage.name,
        webhookStatus: "page_token",
        isActive: true,
        connectedAt: new Date(),
      },
      update: {
        username: igProfile.username || "instagram",
        name: igProfile.name || igProfile.username || "Instagram User",
        profilePicUrl: igProfile.profile_picture_url || null,
        followersCount: igProfile.followers_count || 0,
        biography: igProfile.biography || null,
        accessToken: encrypt(finalToken),
        tokenExpiresAt,
        facebookPageId: selectedPage.id,
        facebookPageName: selectedPage.name,
        webhookStatus: "page_token",
        isActive: true,
        connectedAt: new Date(),
      },
    });

    // حذف OAuth session
    await prisma.oAuthSession.deleteMany({
      where: {
        workspaceId: session.workspaceId,
        userId: session.userId,
      },
    });

    return NextResponse.json({
      ok: true,
      account: {
        instagramId: account.instagramId,
        username: account.username,
        name: account.name,
        profilePicUrl: account.profilePicUrl,
        followersCount: account.followersCount,
      },
    });
  } catch (error) {
    console.error("Connect Instagram error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "خطا در اتصال اینستاگرام" },
      { status: 500 }
    );
  }
}

/**
 * اتصال مستقیم از callback (وقتی فقط یک صفحه است)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pageId = searchParams.get("pageId");

  if (!pageId) {
    return NextResponse.redirect(
      new URL("/dashboard/settings/connection?error=missing_page_id", req.url)
    );
  }

  // فراخوانی POST با pageId
  const session = await requireApiSession(req);
  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  try {
    // استفاده از همان منطق POST
    const response = await POST(req);
    const data = await response.json();

    if (data.ok) {
      return NextResponse.redirect(
        new URL("/dashboard/settings/connection?success=true", req.url)
      );
    } else {
      return NextResponse.redirect(
        new URL(
          `/dashboard/settings/connection?error=${encodeURIComponent(data.error)}`,
          req.url
        )
      );
    }
  } catch (error) {
    return NextResponse.redirect(
      new URL(
        `/dashboard/settings/connection?error=${encodeURIComponent((error as Error).message)}`,
        req.url
      )
    );
  }
}
