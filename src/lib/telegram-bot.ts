export async function sendTelegramMessage(
  chatId: bigint | number,
  text: string
): Promise<void> {
  if (!process.env.TELEGRAM_BOT_TOKEN) return;
  const tgApiBase = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
  await fetch(`${tgApiBase}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId.toString(), text }),
  });
}

export async function sendOtpViaTelegram(
  chatId: bigint | number,
  code: string
): Promise<void> {
  await sendTelegramMessage(
    chatId,
    `🔐 Ваш код для входа в KeyPay: *${code}*\n\nКод действителен 10 минут. Никому не передавайте его.`
  );
}
