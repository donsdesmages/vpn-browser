import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PLANS, PlanId } from "@/lib/yukassa";
import { generateKey, toSurrogateTelegramId } from "@/lib/key-generator";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram-bot";

const SHOP_ID = process.env.YUKASSA_SHOP_ID!;
const SECRET_KEY = process.env.YUKASSA_SECRET_KEY!;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const paymentId = req.nextUrl.searchParams.get("paymentId");
  if (!paymentId) {
    return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });
  }

  // Запрашиваем статус платежа у ЮKassa напрямую
  const ykRes = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
    headers: {
      Authorization: "Basic " + Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString("base64"),
    },
  });

  if (!ykRes.ok) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  const payment = await ykRes.json();

  // Проверяем что платёж принадлежит текущему пользователю
  const { webUserId, planId } = payment.metadata ?? {};
  if (String(webUserId) !== String(session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (payment.status !== "succeeded") {
    return NextResponse.json({ status: payment.status });
  }

  if (!(planId in PLANS)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const user = await prisma.webUser.findUnique({ where: { id: Number(webUserId) } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Идемпотентность: если подписка была активирована менее 2 минут назад —
  // значит этот же платёж уже обработан (защита от двойного вызова)
  if (user.subscriptionStart) {
    const activatedAt = new Date(user.subscriptionStart).getTime();
    if (Date.now() - activatedAt < 2 * 60 * 1000) {
      return NextResponse.json({ status: "already_processed" });
    }
  }

  const telegramId = toSurrogateTelegramId(user.id);
  const plan = PLANS[planId as PlanId];
  const accessKey = await generateKey(telegramId, user.email, plan.seconds);

  await prisma.webUser.update({
    where: { id: user.id },
    data: {
      accessKey,
      subscriptionStart: new Date(),
      durationDays: Math.round(plan.seconds / 86400),
    },
  });

  if (user.telegramChatId) {
    const siteUrl = process.env.NEXTAUTH_URL ?? "http://138.124.25.154:8081";
    await sendTelegramMessage(
      user.telegramChatId,
      `✅ Оплата ${plan.price} ₽ прошла успешно!\n\n🔑 Тариф «${plan.label}» активирован.\n\nЛичный кабинет: ${siteUrl}/dashboard`
    ).catch(() => {});
  }

  return NextResponse.json({ status: "processed" });
}
