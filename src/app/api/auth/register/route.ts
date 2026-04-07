import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { detectContactType, normalizeContact } from "@/lib/contact";
import { createOtp, createLinkToken } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  const { contact, password } = await req.json();
  if (!contact?.trim()) {
    return NextResponse.json({ error: "Введите контакт" }, { status: 400 });
  }

  const type = detectContactType(contact);
  const normalized = normalizeContact(contact, type);

  // Check uniqueness by contact type
  let existing;
  if (type === "email") {
    existing = await prisma.webUser.findFirst({ where: { email: normalized } });
  } else if (type === "phone") {
    existing = await prisma.webUser.findFirst({ where: { phone: normalized } });
  } else {
    existing = await prisma.webUser.findFirst({ where: { telegramUsername: normalized } });
  }

  if (existing) {
    return NextResponse.json({ error: "Контакт уже зарегистрирован" }, { status: 409 });
  }

  // Build user fields
  let email: string;
  let phone: string | null = null;
  let telegramUsername: string | null = null;

  if (type === "email") {
    email = normalized;
  } else if (type === "phone") {
    email = `phone_${normalized.replace("+", "")}@keypay.internal`;
    phone = normalized;
  } else {
    email = `tg_${normalized}@keypay.internal`;
    telegramUsername = normalized;
  }

  const passwordHash = password?.trim()
    ? await bcrypt.hash(password, 10)
    : await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);

  const user = await prisma.webUser.create({
    data: { email, passwordHash, phone, telegramUsername, contactType: type },
  });

  // Send verification
  if (type === "email") {
    const { token, code } = await createOtp(user.id, "otp");
    await sendOtpEmail(normalized, code);
    return NextResponse.json({ token, method: "email" }, { status: 201 });
  }

  // Phone/Telegram: generate link token to connect Telegram
  const linkToken = await createLinkToken(user.id);
  const botUsername = process.env.TELEGRAM_BOT_USERNAME ?? "KeyPayNowBot";
  return NextResponse.json(
    {
      method: "link_required",
      linkToken,
      botUsername,
      deepLink: `https://t.me/${botUsername}?start=link_${linkToken}`,
    },
    { status: 201 }
  );
}
