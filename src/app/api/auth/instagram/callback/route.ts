import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const META_APP_ID = process.env.META_APP_ID || "";
const META_APP_SECRET = process.env.META_APP_SECRET || "";
const META_REDIRECT_URI = process.env.META_REDIRECT_URI || "";

/**
 * Callback بعد از OAuth - دریافت code و تبدیل به Access Token
 */
export async function GET(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorReason = searchParams.get("error_reason");

  // بررسی خطاها
  if (error) {
    const errorMessage = getErrorMessage(error, errorReason);
    return NextResponse.redirect(
      new URL(
        `/dashboard/settings/connection?error=${encodeURIComponent(errorMessage)}`,
        req.url
      )
    );
  }

  // بررسی code و state
  if (!code || !state) {
    return NextResponse.redirect(
      new URL(
        `/dashboard/settings/connection?error=${encodeURIComponent("پارامترهای اتصال معتبر نیست")}`,
        req.url
      )
    );
  }

  // بررسی state برای CSRF protection
  const savedState = req.cookies.get("oauth_state")?.value;
  if (!savedState || savedState !== state) {
    return NextResponse.redirect(
      new URL(
        `/dashboard/settings/connection?error=${encodeURIComponent("خطای امنیتی در اتصال")}`,
        req.url
      )
    );
  }

  try {
    // تبدیل code به Access Token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?${new URLSearchParams({
        client_id: META_APP_ID,
        client_secret: META_APP_SECRET,
        redirect_uri: META_REDIRECT_URI,
        code,
      })}`
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      throw new Error(errorData.error?.message || "دریافت Access Token ناموفق بود");
    }

    const { access_token } = await tokenResponse.json();

    if (!access_token) {
      throw new Error("Access Token دریافت نشد");
    }

    // دریافت لیست صفحات کاربر
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${access_token}`
    );

    if (!pagesResponse.ok) {
      throw new Error("دریافت لیست صفحات ناموفق بود");
    }

    const { data: pages } = await pagesResponse.json();

    if (!pages || pages.length === 0) {
      return NextResponse.redirect(
        new URL(
          `/dashboard/settings/connection?error=${encodeURIComponent("هیچ صفحه‌ای یافت نشد")}`,
          req.url
        )
      );
    }

    // فیلتر صفحاتی که Instagram Business Account دارند
    const pagesWithInstagram = pages.filter(
      (page: any) => page.instagram_business_account
    );

    if (pagesWithInstagram.length === 0) {
      return NextResponse.redirect(
        new URL(
          `/dashboard/settings/connection?error=${encodeURIComponent("هیچ صفحه‌ای با Instagram Business متصل نیست")}`,
          req.url
        )
      );
    }

    // ذخیره موقت اطلاعات برای انتخاب پیج
    await prisma.oAuthSession.create({
      data: {
        workspaceId: session.workspaceId,
        userId: session.userId,
        accessToken: access_token,
        pages: JSON.stringify(pagesWithInstagram),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 دقیقه
      },
    });

    // اگر فقط یک صفحه است، مستقیم اتصال می‌دهیم
    if (pagesWithInstagram.length === 1) {
      return NextResponse.redirect(
        new URL(
          `/api/auth/instagram/connect?pageId=${pagesWithInstagram[0].id}`,
          req.url
        )
      );
    }

    // Redirect به صفحه انتخاب پیج
    return NextResponse.redirect(
      new URL("/dashboard/settings/connection/select-page", req.url)
    );
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      new URL(
        `/dashboard/settings/connection?error=${encodeURIComponent((error as Error).message || "خطا در اتصال به اینستاگرام")}`,
        req.url
      )
    );
  }
}

function getErrorMessage(error: string, reason?: string | null): string {
  if (error === "access_denied") {
    if (reason === "user_denied") {
      return "شما اتصال را لغو کردید";
    }
    return "دسترسی رد شد";
  }

  const errorMessages: Record<string, string> = {
    server_error: "خطای سرور Meta - لطفاً دوباره تلاش کنید",
    temporarily_unavailable: "سرویس Meta موقتاً در دسترس نیست",
    invalid_request: "درخواست نامعتبر است",
    unauthorized_client: "برنامه مجاز به اتصال نیست",
    unsupported_response_type: "نوع پاسخ پشتیبانی نمی‌شود",
  };

  return errorMessages[error] || "خطا در اتصال به اینستاگرام";
}
