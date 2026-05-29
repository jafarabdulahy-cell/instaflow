import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie } from "@/lib/auth";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `workspace-${Date.now()}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!name || !email || password.length < 8) {
      return NextResponse.json({ error: "اطلاعات ثبت‌نام کامل نیست." }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "این ایمیل قبلاً ثبت شده است." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const workspaceName = `${name} Workspace`;
    let slug = slugify(name);
    const duplicateSlug = await prisma.workspace.findUnique({ where: { slug } });
    if (duplicateSlug) slug = `${slug}-${Date.now()}`;

    const workspace = await prisma.workspace.create({
      data: {
        name: workspaceName,
        slug,
        users: {
          create: {
            name,
            email,
            passwordHash,
            role: "owner",
          },
        },
      },
      include: { users: true },
    });

    const user = workspace.users[0];
    const token = createSessionToken({ userId: user.id, workspaceId: workspace.id, email: user.email });
    const res = NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email }, workspace });
    setSessionCookie(res, token);
    return res;
  } catch (error) {
    console.error("register error", error);
    return NextResponse.json({ error: "خطا در ساخت حساب." }, { status: 500 });
  }
}
