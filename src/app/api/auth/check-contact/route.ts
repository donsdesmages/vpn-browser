import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { detectContactType, normalizeContact } from "@/lib/contact";

export async function GET(req: NextRequest) {
  const contact = req.nextUrl.searchParams.get("contact")?.trim();
  if (!contact) return NextResponse.json({ taken: false });

  const type = detectContactType(contact);
  const normalized = normalizeContact(contact, type);

  let existing;
  if (type === "email") {
    existing = await prisma.webUser.findFirst({
      where: { OR: [{ email: normalized }, { linkedEmail: normalized }] },
    });
  } else if (type === "phone") {
    existing = await prisma.webUser.findFirst({ where: { phone: normalized } });
  } else {
    existing = await prisma.webUser.findFirst({ where: { telegramUsername: normalized } });
  }

  return NextResponse.json({ taken: !!existing });
}
