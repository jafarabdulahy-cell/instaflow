import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth";
import { generateOAuthState } from "@/lib/encryption";

const META_APP_ID = process.env.META_APP_ID || "";
const META_REDIRECT_URI = process.env.META_REDIRECT_URI || "";

/**
 * شروع OAuth Flow برای اتصال اینستاگرام
 */
export async function GET(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // بررسی تنظیمات
  if (!META_APP_ID || !META_REDIRECT_URI) {
    return NextResponse.json(
      { 
        error: "OAuth configuration not set", 
        hint: "META_APP_ID and META_REDIRECT_URI must be configured" 
      },
      { status: 500 }
    );
  }

  // تولید state برای CSRF protection
  const state = generateOAuthState();

  // ذخیره state در session/cookie برای بررسی در callback
  const response = NextResponse.json({
    ok: true,
    authUrl: buildMetaOAuthUrl(state),
    state,
  });

  // ذخیره state در cookie
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 دقیقه
    path: "/",
  });

  return response;
}

function buildMetaOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: META_APP_ID,
    redirect_uri: META_REDIRECT_URI,
    state,
    scope: [
      "instagram_basic",
      "instagram_manage_messages",
      "instagram_manage_comments",
      "pages_show_list",
      "pages_read_engagement",
    ].join(","),
    response_type: "code",
    display: "popup",
  });

  return `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;
}
