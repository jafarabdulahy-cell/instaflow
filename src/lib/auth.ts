import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "instaflow_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const DEMO_EMAIL = "admin@instaflow.local";
const DEMO_PASSWORD = "123456";

export type ApiSession = {
  userId: string;
  workspaceId: string;
  email?: string;
  name?: string;
  role?: string;
};

function secret() {
  return process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "instaflow-dev-secret-change-me";
}

export function authCookieName() {
  return COOKIE_NAME;
}

export function signSession(session: ApiSession) {
  return jwt.sign(session, secret(), { expiresIn: "30d" });
}

// Backward-compatible alias for older auth/register routes that still import this name.
export function createSessionToken(session: ApiSession) {
  return signSession(session);
}

// Shared cookie writer used by register/login style routes.
export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function verifySessionToken(token?: string | null): ApiSession | null {
  if (!token) return null;
  try {
    return jwt.verify(token, secret()) as ApiSession;
  } catch {
    return null;
  }
}

export async function requireApiSession(req: NextRequest): Promise<ApiSession | null> {
  const fromCookie = req.cookies.get(COOKIE_NAME)?.value;
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return verifySessionToken(fromCookie || bearer);
}

export async function authenticateUser(email: string, password: string) {
  let user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() }, include: { workspace: true } });

  if (!user) {
    const totalUsers = await prisma.user.count().catch(() => 0);
    const allowBootstrap = process.env.ALLOW_DEMO_BOOTSTRAP === "true" || totalUsers === 0;
    if (allowBootstrap) {
      const workspace = await prisma.workspace.upsert({
        where: { slug: "default" },
        create: { name: "InstaFlow", slug: "default" },
        update: { name: "InstaFlow" },
      });
      const hash = await bcrypt.hash(password || DEMO_PASSWORD, 10);
      user = await prisma.user.create({
        data: {
          workspaceId: workspace.id,
          name: "مدیر سیستم",
          email: email.trim().toLowerCase() || DEMO_EMAIL,
          passwordHash: hash,
          role: "owner",
          plan: "pro",
        },
        include: { workspace: true },
      });
    }
  }

  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash).catch(() => false);
  if (!ok) return null;

  return {
    user,
    session: {
      userId: user.id,
      workspaceId: user.workspaceId,
      email: user.email,
      name: user.name,
      role: user.role,
    } satisfies ApiSession,
  };
}
