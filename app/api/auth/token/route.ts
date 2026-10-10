import { NextResponse } from "next/server";
import { currentAccount, issueConvexToken } from "@/shared/lib/localAuth/session";

export async function GET() {
  const account = await currentAccount();
  if (!account) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ token: issueConvexToken(account) }, { headers: { "Cache-Control": "no-store" } });
}
