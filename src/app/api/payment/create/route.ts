import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createPayment, PLANS, PlanId } from "@/lib/yukassa";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { planId } = await req.json();
  if (!planId || !(planId in PLANS)) {
    return NextResponse.json({ error: "Неверный тариф" }, { status: 400 });
  }

  const returnUrl = `${process.env.NEXTAUTH_URL}/dashboard?payment=success`;
  const payment = await createPayment(
    planId as PlanId,
    Number(session.user.id),
    returnUrl
  );

  return NextResponse.json({ confirmationUrl: payment.confirmationUrl });
}
