const SHOP_ID = process.env.YUKASSA_SHOP_ID!;
const SECRET_KEY = process.env.YUKASSA_SECRET_KEY!;
const BASE_URL = "https://api.yookassa.ru/v3";

export const PLANS = {
  week: { label: "Неделя", price: 60, seconds: 604800 },
  month: { label: "Месяц", price: 299, seconds: 2592000 },
  quarter: { label: "3 месяца", price: 599, seconds: 7776000 },
} as const;

export type PlanId = keyof typeof PLANS;

export interface PaymentMetadata {
  webUserId: string;
  planId: PlanId;
}

export async function createPayment(
  planId: PlanId,
  webUserId: number,
  returnUrl: string
): Promise<{ id: string; confirmationUrl: string }> {
  const plan = PLANS[planId];
  const idempotenceKey = `${webUserId}-${planId}-${Date.now()}`;

  const notificationUrl = `${process.env.NEXTAUTH_URL}/api/payment/callback`;

  const body = {
    amount: { value: String(plan.price) + ".00", currency: "RUB" },
    confirmation: { type: "redirect", return_url: returnUrl },
    capture: true,
    description: `VPN ${plan.label}`,
    metadata: { webUserId: String(webUserId), planId } satisfies PaymentMetadata,
    notification_url: notificationUrl,
  };

  const res = await fetch(`${BASE_URL}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotence-Key": idempotenceKey,
      Authorization:
        "Basic " + Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString("base64"),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`YooKassa error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return {
    id: data.id,
    confirmationUrl: data.confirmation.confirmation_url,
  };
}
