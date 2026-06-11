import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * دریافت لیست صفحات برای انتخاب کاربر
 */
export async function GET(req: NextRequest) {
  const session = await requireApiSession(req);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    // دریافت آخرین OAuth session
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

    return NextResponse.json({
      ok: true,
      pages: pages.map((page: any) => ({
        id: page.id,
        name: page.name,
        instagram: page.instagram_business_account
          ? {
              id: page.instagram_business_account.id,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error("Get pages error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "خطا در دریافت لیست صفحات" },
      { status: 500 }
    );
  }
}
