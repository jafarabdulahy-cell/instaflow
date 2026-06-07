import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, authCookieName, signSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!email || !password) return NextResponse.json({ ok: false, error: "ایمیل و رمز عبور الزامی است." }, { status: 400 });

  const auth = await authenticateUser(email, password);
  if (!auth) return NextResponse.json({ ok: false, error: "اطلاعات ورود صحیح نیست." }, { status: 401 });

  const token = signSession(auth.session);
  const res = NextResponse.json({ ok: true, user: { id: auth.user.id, name: auth.user.name, email: auth.user.email } });
  res.cookies.set(authCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
