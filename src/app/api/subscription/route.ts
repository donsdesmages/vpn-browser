import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserInfo, toSurrogateTelegramId } from "@/lib/key-generator";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const telegramId = toSurrogateTelegramId(Number(session.user.id));
  const info = await getUserInfo(telegramId);

  return NextResponse.json(info);
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
