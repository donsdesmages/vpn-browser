import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password || password.length < 6) {
    return NextResponse.json(
      { error: "Некорректные данные" },
      { status: 400 }
    );
  }

  const existing = await prisma.webUser.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Email уже используется" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.webUser.create({ data: { email, passwordHash } });

  return NextResponse.json({ ok: true }, { status: 201 });
}
