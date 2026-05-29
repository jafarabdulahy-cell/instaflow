import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    const user = await prisma.user.findUnique({ where: { email }, include: { workspace: true } });
    if (!user) {
      return NextResponse.json({ error: "ایمیل یا رمز عبور اشتباه است." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "ایمیل یا رمز عبور اشتباه است." }, { status: 401 });
    }

    const token = createSessionToken({ userId: user.id, workspaceId: user.workspaceId, email: user.email });
    const res = NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email }, workspace: user.workspace });
    setSessionCookie(res, token);
    return res;
  } catch (error) {
    console.error("login error", error);
    return NextResponse.json({ error: "خطا در ورود." }, { status: 500 });
  }
}
