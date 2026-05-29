import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth";

const DEFAULT_SCOPES = [
  "instagram_basic",
  "instagram_manage_messages",
  "instagram_manage_comments",
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_metadata",
].join(",");

export async function GET(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) return NextResponse.redirect(new URL("/auth/login?next=/connect", req.url));

  const appId = process.env.META_APP_ID;
  const appUrl = process.env.NEXTAUTH_URL || new URL(req.url).origin;
  const redirectUri = `${appUrl}/api/auth/instagram/callback`;

  if (!appId) {
    return NextResponse.redirect(new URL("/connect?error=missing_meta_app_id", req.url));
  }

  const state = Buffer.from(
    JSON.stringify({ workspaceId: session.workspaceId, userId: session.userId, ts: Date.now() })
  ).toString("base64url");

  const authUrl = new URL("https://www.facebook.com/v21.0/dialog/oauth");
  authUrl.searchParams.set("client_id", appId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", process.env.META_OAUTH_SCOPES || DEFAULT_SCOPES);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("state", state);

  return NextResponse.redirect(authUrl);
}
