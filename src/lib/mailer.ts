import nodemailer from "nodemailer";

// Переиспользуем транспортёр — не открываем новое TLS-соединение на каждый запрос
let _transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      pool: true,       // connection pool
      maxConnections: 3,
    });
  }
  return _transporter;
}

export async function sendOtpEmail(email: string, code: string): Promise<void> {
  await getTransporter().sendMail({
    from: `"KeyPay" <${process.env.GMAIL_USER}>`,
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
