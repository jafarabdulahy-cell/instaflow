import { NextResponse } from "next/server";
import { listAutoReplyRules, getAutoReplyMode, isLiveAutoReplyAllowed } from "@/lib/auto-reply";

export async function GET() {
  return NextResponse.json({
    ok: true,
    mode: getAutoReplyMode(),
    liveSendAllowed: isLiveAutoReplyAllowed(),
    rules: listAutoReplyRules(),
  });
}
