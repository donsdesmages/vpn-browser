import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email } = await req.json();
  if (!email?.trim()) {
    return NextResponse.json({ error: "Введите email" }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(normalized)) {
    return NextResponse.json({ error: "Некорректный email" }, { status: 400 });
  }

  // Проверяем уникальность
  const existing = await prisma.webUser.findFirst({
    where: { OR: [{ email: normalized }, { linkedEmail: normalized }] },
  });
  if (existing) {
    return NextResponse.json({ error: "Этот email уже используется" }, { status: 409 });
  }

  await prisma.webUser.update({
    where: { id: Number(session.user?.id) },
    data: { linkedEmail: normalized },
  });

  return NextResponse.json({ ok: true });
}
