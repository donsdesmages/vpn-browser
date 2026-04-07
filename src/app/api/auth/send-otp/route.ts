import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { detectContactType, normalizeContact } from "@/lib/contact";
import { createOtp, createLinkToken } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/resend";
import { sendOtpViaTelegram } from "@/lib/telegram-bot";

export async function POST(req: NextRequest) {
  const { contact } = await req.json();
  if (!contact?.trim()) {
    return NextResponse.json({ error: "Введите контакт" }, { status: 400 });
  }

  const type = detectContactType(contact);
  const normalized = normalizeContact(contact, type);

  let user;
  if (type === "email") {
    user = await prisma.webUser.findFirst({ where: { email: normalized } });
  } else if (type === "phone") {
    user = await prisma.webUser.findFirst({ where: { phone: normalized } });
  } else {
    user = await prisma.webUser.findFirst({ where: { telegramUsername: normalized } });
  }

  if (!user) {
    return NextResponse.json({ error: "Аккаунт не найден" }, { status: 404 });
  }

  if (type === "email") {
    const { token, code } = await createOtp(user.id, "otp");
    await sendOtpEmail(normalized, code);
    return NextResponse.json({ token, method: "email" });
  }

  // phone or telegram — need chat_id
  if (user.telegramChatId) {
    const { token, code } = await createOtp(user.id, "otp");
    await sendOtpViaTelegram(user.telegramChatId, code);
    return NextResponse.json({ token, method: "telegram" });
  }

  // Need to link Telegram first
  const linkToken = await createLinkToken(user.id);
  const botUsername = process.env.TELEGRAM_BOT_USERNAME ?? "KeyPayNowBot";
  return NextResponse.json({
    method: "link_required",
    linkToken,
    botUsername,
    deepLink: `https://t.me/${botUsername}?start=link_${linkToken}`,
  });
}
