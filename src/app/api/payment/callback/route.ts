import { NextRequest, NextResponse } from "next/server";
import { PLANS, PlanId } from "@/lib/yukassa";
import { generateKey, toSurrogateTelegramId } from "@/lib/key-generator";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram-bot";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.event !== "payment.succeeded") {
    return NextResponse.json({ ok: true });
  }

  const { webUserId, planId } = body.object?.metadata ?? {};
  if (!webUserId || !planId || !(planId in PLANS)) {
    return NextResponse.json({ error: "Bad metadata" }, { status: 400 });
  }

  const user = await prisma.webUser.findUnique({
    where: { id: Number(webUserId) },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const telegramId = toSurrogateTelegramId(user.id);
  const plan = PLANS[planId as PlanId];

  const accessKey = await generateKey(telegramId, user.email, plan.seconds);

  await prisma.webUser.update({
    where: { id: user.id },
    data: { accessKey },
  });

  if (user.telegramChatId) {
    const siteUrl = process.env.NEXTAUTH_URL ?? "http://77.110.125.22:8081";
    await sendTelegramMessage(
      user.telegramChatId,
      `✅ Оплата ${plan.price} ₽ прошла успешно!\n\n🔑 Тариф «${plan.label}» активирован.\n\nЛичный кабинет: ${siteUrl}/dashboard`
    );
  }

  return NextResponse.json({ ok: true });
}
