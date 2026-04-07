import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { consumeLinkToken } from "@/lib/otp";

export async function POST(req: NextRequest) {
  const { token, chatId } = await req.json();
  if (!token || !chatId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const userId = await consumeLinkToken(token);
  if (!userId) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  await prisma.webUser.update({
    where: { id: userId },
    data: { telegramChatId: BigInt(chatId) },
  });

  return NextResponse.json({ ok: true });
}
