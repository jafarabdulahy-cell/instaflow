import { handleWebhookGet, handleWebhookPost } from "@/lib/meta-webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handleWebhookGet;
export const POST = handleWebhookPost;
