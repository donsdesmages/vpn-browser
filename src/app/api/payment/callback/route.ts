import { NextRequest, NextResponse } from "next/server";
import { PLANS, PlanId } from "@/lib/yukassa";
import { generateKey, toSurrogateTelegramId } from "@/lib/key-generator";
import { prisma } from "@/lib/prisma";

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

  await generateKey(telegramId, user.email, plan.seconds);

  return NextResponse.json({ ok: true });
}
