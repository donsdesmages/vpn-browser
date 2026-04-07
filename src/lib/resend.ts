import { Resend } from "resend";

export async function sendOtpEmail(email: string, code: string): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "KeyPay <noreply@keypay.ru>",
    to: email,
    subject: `Ваш код входа: ${code}`,
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:32px;background:#0a0f1e;color:#f0f4ff;border-radius:16px">
        <h2 style="color:#60a5fa;margin-bottom:8px">KeyPay</h2>
        <p style="color:#6b7a99;margin-bottom:24px">Ваш код для входа:</p>
        <div style="font-size:48px;font-weight:bold;letter-spacing:12px;color:#3b82f6;text-align:center;margin:24px 0">
          ${code}
        </div>
        <p style="color:#6b7a99;font-size:13px">Код действителен 10 минут. Не передавайте его никому.</p>
      </div>
    `,
  });
}
