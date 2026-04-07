import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { detectContactType, normalizeContact } from "@/lib/contact";

export async function POST(req: NextRequest) {
  const { contact, password } = await req.json();

  if (!contact?.trim()) {
    return NextResponse.json({ error: "Введите контакт" }, { status: 400 });
  }
  if (!password || password.length < 6) {
    return NextResponse.json({ error: "Пароль должен быть не менее 6 символов" }, { status: 400 });
  }

  const type = detectContactType(contact);
  const normalized = normalizeContact(contact, type);

  // Проверяем уникальность
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

  // Строим поля пользователя
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

  const passwordHash = await bcrypt.hash(password, 8);

  await prisma.webUser.create({
    data: { email, passwordHash, phone, telegramUsername, contactType: type },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
