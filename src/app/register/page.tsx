"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import KeyIcon from "@/components/KeyIcon";
import { detectContactType, CONTACT_LABELS, CONTACT_ICONS } from "@/lib/contact";

type Step = "form" | "otp" | "link_required";

export default function RegisterPage() {
  const router = useRouter();
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [otpToken, setOtpToken] = useState("");
  const [linkData, setLinkData] = useState<{
    linkToken: string;
    botUsername: string;
    deepLink: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const contactType = contact.trim() ? detectContactType(contact) : null;

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact, password: password || undefined }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Ошибка регистрации");
      return;
    }

    if (data.method === "email") {
      setOtpToken(data.token);
      setStep("otp");
    } else if (data.method === "link_required") {
      setLinkData({ linkToken: data.linkToken, botUsername: data.botUsername, deepLink: data.deepLink });
      setStep("link_required");
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      otpToken,
      otpCode: otp,
      redirect: false,
    });

    setLoading(false);
    if (res?.error) {
      setError("Неверный или истёкший код");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <main className="relative flex items-center justify-center min-h-screen px-4 py-8 z-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8 animate-fade-up">
          <div className="animate-float animate-glow-pulse mb-4">
            <KeyIcon size={72} />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {step === "otp" ? "Введите код" : step === "link_required" ? "Привяжите Telegram" : "Регистрация"}
          </h1>
          <p className="text-[#6b7a99] text-sm mt-1">
            {step === "otp"
              ? "Код отправлен на ваш email"
              : step === "link_required"
              ? "Для входа нужен Telegram"
              : "Создайте аккаунт KeyPay"}
          </p>
        </div>

        <div className="glass rounded-2xl p-8 animate-fade-up-delay-1">
          {/* Step: form */}
          {step === "form" && (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-[#6b7a99] mb-1.5 flex items-center gap-2">
                  {contactType && (
                    <span>{CONTACT_ICONS[contactType]} {CONTACT_LABELS[contactType]}</span>
                  )}
                  {!contactType && "Контакт"}
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="email, +79001234567 или @telegram"
                  required
                  className="input-field w-full px-4 py-3 rounded-xl"
                />
                <p className="text-[#6b7a99] text-xs mt-1.5">
                  Email, номер телефона или Telegram @username
                </p>
              </div>

              {contactType === "email" && (
                <div>
                  <label className="text-sm text-[#6b7a99] mb-1.5 block">
                    Пароль <span className="text-[#4a5468]">(необязательно)</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Минимум 6 символов"
                    minLength={6}
                    className="input-field w-full px-4 py-3 rounded-xl"
                  />
                  <p className="text-[#6b7a99] text-xs mt-1.5">
                    Можно войти и без пароля — по коду на email
                  </p>
                </div>
              )}

              {error && (
                <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 rounded-xl mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? "Создаём аккаунт..." : "Зарегистрироваться"}
              </button>
            </form>
          )}

          {/* Step: OTP */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-[#6b7a99] mb-1.5 block">Код из письма</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="• • • • • •"
                  required
                  maxLength={6}
                  className="input-field w-full px-4 py-4 rounded-xl text-center text-2xl tracking-[0.5em] font-bold"
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="btn-primary w-full py-3 rounded-xl mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? "Проверяем..." : "Подтвердить"}
              </button>

              <button
                type="button"
                onClick={() => setStep("form")}
                className="text-[#6b7a99] text-sm hover:text-white transition-colors text-center"
              >
                ← Изменить контакт
              </button>
            </form>
          )}

          {/* Step: link_required */}
          {step === "link_required" && linkData && (
            <div className="flex flex-col gap-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-[#93c5fd]">
                <p className="font-semibold mb-2">Аккаунт создан!</p>
                <p>Для входа через Telegram откройте бота и отправьте команду:</p>
                <div className="bg-black/30 rounded-lg p-3 mt-2 font-mono text-xs break-all text-white">
                  /start link_{linkData.linkToken}
                </div>
              </div>

              <a
                href={linkData.deepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full py-3 rounded-xl text-center text-sm font-semibold"
              >
                Открыть @{linkData.botUsername}
              </a>

              <p className="text-[#6b7a99] text-xs text-center">
                После привязки вернитесь и войдите через эту страницу
              </p>

              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-[#6b7a99] text-sm hover:text-white transition-colors text-center"
              >
                Перейти ко входу
              </button>
            </div>
          )}

          <p className="text-center text-[#6b7a99] text-sm mt-6">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-[#60a5fa] hover:text-blue-300 transition-colors">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
