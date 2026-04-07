"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { loginWithCredentials } from "@/app/actions";
import Link from "next/link";
import KeyIcon from "@/components/KeyIcon";
import { detectContactType, CONTACT_LABELS } from "@/lib/contact";

type Step = "form" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [justRegistered, setJustRegistered] = useState(false);

  useEffect(() => {
    setJustRegistered(new URLSearchParams(window.location.search).get("registered") === "1");
  }, []);
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [otpToken, setOtpToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const contactType = contact.trim() ? detectContactType(contact) : null;
  const isEmail = contactType === "email";

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginWithCredentials(contact, password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("CredentialsSignin") || msg.includes("credentials")) {
        setError("Неверный контакт или пароль");
      } else {
        setError("Ошибка соединения. Попробуйте ещё раз.");
      }
      setLoading(false);
    }
  }

  async function handleSendCode() {
    setError("");
    setSendingCode(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact }),
      });

      const data = await res.json();
      setSendingCode(false);

      if (!res.ok) {
        setError(data.error || "Ошибка отправки кода");
        return;
      }

      setOtpToken(data.token);
      setStep("otp");
    } catch {
      setError("Ошибка соединения. Попробуйте ещё раз.");
      setSendingCode(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        otpToken,
        otpCode: otp,
        redirect: false,
      });

      if (res?.ok) {
        router.push("/dashboard");
      } else {
        setError("Неверный или истёкший код");
        setLoading(false);
      }
    } catch {
      setError("Ошибка соединения. Попробуйте ещё раз.");
      setLoading(false);
    }
  }

  return (
    <main className="relative flex items-center justify-center min-h-screen px-4 z-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8 animate-fade-up">
          <div className="animate-float animate-glow-pulse mb-4">
            <KeyIcon size={72} />
          </div>
          <h1 className="text-2xl font-bold text-white">
            Вход в <span className="gradient-text">KeyPay</span>
          </h1>
          <p className="text-[#6b7a99] text-sm mt-1">Ключи доступа без Telegram</p>
        </div>

        <div className="glass rounded-2xl p-8 animate-fade-up-delay-1">

          {justRegistered && (
            <div className="text-green-400 text-sm text-center bg-green-500/10 border border-green-500/20 rounded-xl py-2 mb-4">
              ✅ Аккаунт создан — войдите чтобы продолжить
            </div>
          )}

          {/* Шаг 1: форма */}
          {step === "form" && (
            <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-[#6b7a99] mb-1.5 block">
                  {contactType ? CONTACT_LABELS[contactType] : "Контакт"}
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="email, +79001234567 или @telegram"
                  required
                  className="input-field w-full px-4 py-3 rounded-xl"
                />
              </div>

              <div>
                <label className="text-sm text-[#6b7a99] mb-1.5 block">Пароль</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="input-field w-full px-4 py-3 pr-11 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7a99] hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? "Входим..." : "Войти"}
              </button>

              {isEmail && (
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={sendingCode || !contact.trim()}
                  className="glass w-full py-3 rounded-xl text-sm text-[#60a5fa] hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingCode ? "Отправляем код..." : "Войти по коду на email"}
                </button>
              )}
            </form>
          )}

          {/* Шаг 2: ввод кода */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <div className="text-sm text-[#6b7a99] text-center mb-2">
                Код отправлен на{" "}
                <span className="text-white font-semibold">{contact}</span>
              </div>

              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="• • • • • •"
                required
                maxLength={6}
                autoFocus
                className="input-field w-full px-4 py-4 rounded-xl text-center text-2xl tracking-[0.5em] font-bold"
              />

              {error && (
                <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="btn-primary w-full py-3 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? "Проверяем..." : "Войти"}
              </button>

              <button
                type="button"
                onClick={() => { setStep("form"); setOtp(""); setError(""); }}
                className="text-[#6b7a99] text-sm hover:text-white transition-colors text-center"
              >
                ← Назад
              </button>
            </form>
          )}

          <p className="text-center text-[#6b7a99] text-sm mt-6">
            Нет аккаунта?{" "}
            <Link href="/register" className="text-[#60a5fa] hover:text-blue-300 transition-colors">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
