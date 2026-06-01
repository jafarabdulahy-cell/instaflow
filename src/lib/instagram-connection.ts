import { prisma } from "@/lib/prisma";
import { clean, maskToken, verifyInstagramProfile } from "@/lib/instagram-api";

type ConnectionSource = "database" | "server_env";

export type InstagramConnection = {
  source: ConnectionSource;
  instagramId: string;
  accessToken: string;
  username?: string | null;
  name?: string | null;
  tokenPreview: string;
  account?: Awaited<ReturnType<typeof findActiveInstagramAccount>>;
};

const ENV_ID_KEYS = ["INSTAGRAM_ID", "META_INSTAGRAM_ID", "IG_ACCOUNT_ID", "INSTAGRAM_ACCOUNT_ID"];
const ENV_TOKEN_KEYS = ["INSTAGRAM_ACCESS_TOKEN", "META_IG_ACCESS_TOKEN", "IG_ACCESS_TOKEN", "META_INSTAGRAM_TOKEN"];
const ENV_USERNAME_KEYS = ["INSTAGRAM_USERNAME", "META_INSTAGRAM_USERNAME", "IG_USERNAME"];

function firstEnv(keys: string[]) {
  for (const key of keys) {
    const value = clean(process.env[key]);
    if (value) return value;
  }
  return "";
}

export function getServerInstagramConfig() {
  const instagramId = firstEnv(ENV_ID_KEYS);
  const accessToken = firstEnv(ENV_TOKEN_KEYS);
  const username = firstEnv(ENV_USERNAME_KEYS) || "shanshin.rest";
  const name = clean(process.env.INSTAGRAM_NAME) || username;

  if (!instagramId || !accessToken) return null;
  return {
    instagramId,
    accessToken,
    username,
    name,
    tokenPreview: maskToken(accessToken),
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

  // v9: اگر Railway/Server ENV تنظیم شده باشد، همیشه اولویت با آن است.
  // دلیل: توکن باید مخفی بماند و کاربر نباید هر بار آن را در UI وارد کند.
  // این کار همچنین مشکل نمایش Instagram ID قدیمی از دیتابیس را حل می‌کند.
  if (serverConfig) {
    return {
      source: "server_env",
      instagramId: serverConfig.instagramId,
      accessToken: serverConfig.accessToken,
      username: serverConfig.username,
      name: serverConfig.name,
      tokenPreview: serverConfig.tokenPreview,
      account: account || null,
    };
  }

  if (account?.instagramId && account?.accessToken && account.accessToken !== "server_env") {
    return {
      source: "database",
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
  if (connection.account?.id && connection.account.instagramId === connection.instagramId) {
    // اگر توکن از env آمده اما در دیتابیس مقدار قدیمی/placeholder است، آن را به توکن فعلی سرور sync می‌کنیم.
    if (connection.source === "server_env" && connection.account.accessToken !== connection.accessToken) {
      return prisma.instagramAccount.update({
        where: { id: connection.account.id },
        data: {
          accessToken: connection.accessToken,
          username: connection.username || connection.account.username,
          name: connection.name || connection.account.name,
          isActive: true,
          connectedAt: new Date(),
        },
      });
    }
    return connection.account;
  }

  let username = clean(connection.username) || "shanshin.rest";
  let name = clean(connection.name) || username;

  try {
    const profile = await verifyInstagramProfile({ instagramId: connection.instagramId, accessToken: connection.accessToken });
    username = clean(profile.username) || username;
    name = clean(profile.name) || name;
  } catch {
    // اگر پروفایل در لحظه قابل خواندن نبود، باز هم اتصال env را برای sync نگه می‌داریم و خطای اصلی در مرحله API برمی‌گردد.
  }

  await prisma.instagramAccount.updateMany({
    where: { workspaceId, instagramId: { not: connection.instagramId } },
    data: { isActive: false },
  });

  return prisma.instagramAccount.upsert({
    where: {
      workspaceId_instagramId: {
        workspaceId,
        instagramId: connection.instagramId,
      },
    },
    create: {
      workspaceId,
      instagramId: connection.instagramId,
      username,
      name,
      accessToken: connection.accessToken,
      webhookStatus: "pending",
      isActive: true,
      connectedAt: new Date(),
    },
    update: {
      username,
      name,
      accessToken: connection.accessToken,
      isActive: true,
      connectedAt: new Date(),
    },
  });
}
