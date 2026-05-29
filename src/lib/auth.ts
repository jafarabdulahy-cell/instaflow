import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "instaflow_session";
const MAX_AGE = 60 * 60 * 24 * 30;

type SessionPayload = {
  userId: string;
  workspaceId: string;
  email: string;
};

function getSecret() {
  return process.env.NEXTAUTH_SECRET || "dev-only-change-this-secret-32chars";
}

export function createSessionToken(payload: SessionPayload) {
  return jwt.sign(payload, getSecret(), { expiresIn: `${MAX_AGE}s` });
}

export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export function readTokenFromRequest(req: NextRequest) {
  return req.cookies.get(COOKIE_NAME)?.value;
}

export async function getSessionFromToken(token?: string | null): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    return jwt.verify(token, getSecret()) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  const session = await getSessionFromToken(token);
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.userId },
    include: { workspace: true },
  });
}

export async function requireApiSession(req: NextRequest) {
  const session = await getSessionFromToken(readTokenFromRequest(req));
  if (!session) return null;
  return session;
}
