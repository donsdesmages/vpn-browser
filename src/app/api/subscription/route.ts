import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserInfo, toSurrogateTelegramId } from "@/lib/key-generator";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const telegramId = toSurrogateTelegramId(userId);

  const [info, user] = await Promise.all([
    getUserInfo(telegramId),
    prisma.webUser.findUnique({
      where: { id: userId },
      select: { accessKey: true, subscriptionStart: true, durationDays: true },
    }),
  ]);

  return NextResponse.json({
    ...info,
    accessKey: user?.accessKey ?? null,
    subscriptionStart: user?.subscriptionStart?.toISOString() ?? null,
    durationDays: user?.durationDays ?? null,
  });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const telegramId = toSurrogateTelegramId(Number(session.user.id));
  const { removeUser } = await import("@/lib/key-generator");
  await removeUser(telegramId);

  return NextResponse.json({ ok: true });
}
