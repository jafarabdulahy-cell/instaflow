import { prisma } from "@/lib/prisma";
import { clean, maskToken, verifyInstagramProfile, verifyPageProfile } from "@/lib/instagram-api";

type ConnectionSource = "database" | "server_env";
type ConnectionMode = "instagram_login" | "page_token";

export type InstagramConnection = {
  source: ConnectionSource;
  mode: ConnectionMode;
  instagramId: string;
  accessToken: string;
  pageId?: string | null;
  pageAccessToken?: string | null;
  username?: string | null;
  name?: string | null;
  tokenPreview: string;
  pageTokenPreview?: string;
  account?: Awaited<ReturnType<typeof findActiveInstagramAccount>>;
};

const ENV_ID_KEYS = ["INSTAGRAM_ID", "META_INSTAGRAM_ID", "IG_ACCOUNT_ID", "INSTAGRAM_ACCOUNT_ID"];
const ENV_TOKEN_KEYS = ["INSTAGRAM_ACCESS_TOKEN", "META_IG_ACCESS_TOKEN", "IG_ACCESS_TOKEN", "META_INSTAGRAM_TOKEN"];
const ENV_USERNAME_KEYS = ["INSTAGRAM_USERNAME", "META_INSTAGRAM_USERNAME", "IG_USERNAME"];
const ENV_PAGE_ID_KEYS = ["META_PAGE_ID", "FACEBOOK_PAGE_ID", "PAGE_ID", "FB_PAGE_ID"];
const ENV_PAGE_TOKEN_KEYS = ["META_PAGE_ACCESS_TOKEN", "FACEBOOK_PAGE_ACCESS_TOKEN", "PAGE_ACCESS_TOKEN", "FB_PAGE_ACCESS_TOKEN"];

function firstEnv(keys: string[]) {
  for (const key of keys) {
    const value = clean(process.env[key]);
    if (value) return value;
  }
  return "";
}

export function getServerInstagramConfig() {
  const instagramId = firstEnv(ENV_ID_KEYS);
  const instagramAccessToken = firstEnv(ENV_TOKEN_KEYS);
  const pageId = firstEnv(ENV_PAGE_ID_KEYS);
  const pageAccessToken = firstEnv(ENV_PAGE_TOKEN_KEYS);
  const username = firstEnv(ENV_USERNAME_KEYS) || "shanshin.rest";
  const name = clean(process.env.INSTAGRAM_NAME) || username;

  // v14: مسیر اصلی دایرکت با Page Access Token است. اگر Page ID/Token ست شده باشد، همیشه اولویت دارد.
  if (instagramId && pageId && pageAccessToken) {
    return {
      mode: "page_token" as const,
      instagramId,
      accessToken: pageAccessToken,
      pageId,
      pageAccessToken,
      username,
      name,
      tokenPreview: maskToken(pageAccessToken),
      pageTokenPreview: maskToken(pageAccessToken),
    };
  }

  if (!instagramId || !instagramAccessToken) return null;
  return {
    mode: "instagram_login" as const,
    instagramId,
    accessToken: instagramAccessToken,
    pageId: pageId || null,
    pageAccessToken: pageAccessToken || null,
    username,
    name,
    tokenPreview: maskToken(instagramAccessToken),
    pageTokenPreview: pageAccessToken ? maskToken(pageAccessToken) : "",
  };
}

export async function findActiveInstagramAccount(workspaceId: string) {
  return prisma.instagramAccount.findFirst({
    where: { workspaceId, isActive: true, NOT: { accessToken: "manual" } },
    orderBy: { connectedAt: "desc" },
  });
}

export async function resolveInstagramConnection(workspaceId: string): Promise<InstagramConnection | null> {
  const account = await findActiveInstagramAccount(workspaceId);
  const serverConfig = getServerInstagramConfig();

  if (serverConfig) {
    return {
      source: "server_env",
      mode: serverConfig.mode,
      instagramId: serverConfig.instagramId,
      accessToken: serverConfig.accessToken,
      pageId: serverConfig.pageId,
      pageAccessToken: serverConfig.pageAccessToken,
      username: serverConfig.username,
      name: serverConfig.name,
      tokenPreview: serverConfig.tokenPreview,
      pageTokenPreview: serverConfig.pageTokenPreview,
      account: account || null,
    };
  }

  if (account?.instagramId && account?.accessToken && account.accessToken !== "server_env") {
    return {
      source: "database",
      mode: "instagram_login",
      instagramId: account.instagramId,
      accessToken: account.accessToken,
      username: account.username,
      name: account.name,
      tokenPreview: maskToken(account.accessToken),
      account,
    };
  }

  return null;
}

export async function ensureInstagramAccountFromConnection(workspaceId: string, connection: InstagramConnection) {
  let username = clean(connection.username) || "shanshin.rest";
  let name = clean(connection.name) || username;
  let effectiveInstagramId = connection.instagramId;

  try {
    if (connection.mode === "page_token" && connection.pageId) {
      const page = await verifyPageProfile({
        instagramId: connection.instagramId,
        accessToken: connection.accessToken,
        pageId: connection.pageId,
        pageAccessToken: connection.pageAccessToken || connection.accessToken,
      });
      effectiveInstagramId = clean(page.instagram_business_account?.id) || effectiveInstagramId;
      name = clean(page.name) || name;
    } else {
      const profile = await verifyInstagramProfile({ instagramId: connection.instagramId, accessToken: connection.accessToken });
      effectiveInstagramId = clean(profile.id) || effectiveInstagramId;
      username = clean(profile.username) || username;
      name = clean(profile.name) || name;
    }
  } catch {
    // اگر پروفایل در لحظه قابل خواندن نبود، همان ID تنظیم‌شده را نگه می‌داریم و خطای اصلی در مرحله API برمی‌گردد.
  }

  const matchingAccount = connection.account?.id && connection.account.instagramId === effectiveInstagramId
    ? connection.account
    : await prisma.instagramAccount.findFirst({
        where: { workspaceId, instagramId: effectiveInstagramId },
        orderBy: { connectedAt: "desc" },
      });

  await prisma.instagramAccount.updateMany({
    where: { workspaceId, instagramId: { not: effectiveInstagramId } },
    data: { isActive: false },
  });

  if (matchingAccount?.id) {
    return prisma.instagramAccount.update({
      where: { id: matchingAccount.id },
      data: {
        username,
        name,
        accessToken: connection.accessToken,
        facebookPageId: connection.pageId || null,
        isActive: true,
        connectedAt: new Date(),
      },
    });
  }

  return prisma.instagramAccount.upsert({
    where: {
      workspaceId_instagramId: {
        workspaceId,
        instagramId: effectiveInstagramId,
      },
    },
    create: {
      workspaceId,
      instagramId: effectiveInstagramId,
      username,
      name,
      accessToken: connection.accessToken,
      facebookPageId: connection.pageId || null,
      webhookStatus: connection.mode,
      isActive: true,
      connectedAt: new Date(),
    },
    update: {
      username,
      name,
      accessToken: connection.accessToken,
      facebookPageId: connection.pageId || null,
      webhookStatus: connection.mode,
      isActive: true,
      connectedAt: new Date(),
    },
  });
}
