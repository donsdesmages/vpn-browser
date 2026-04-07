import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createLinkToken } from "@/lib/otp";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const user = await prisma.webUser.findUnique({
    where: { id: Number(session.user.id) },
    select: { telegramChatId: true },
  });

  if (user?.telegramChatId) {
    return NextResponse.json({ alreadyLinked: true });
  }

  const linkToken = await createLinkToken(Number(session.user.id));
  const botUsername = process.env.TELEGRAM_BOT_USERNAME ?? "KeyPayNowBot";
  return NextResponse.json({
    alreadyLinked: false,
    linkToken,
    botUsername,
    deepLink: `https://t.me/${botUsername}?start=link_${linkToken}`,
  });
}
