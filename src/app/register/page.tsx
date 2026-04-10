"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import KeyIcon from "@/components/KeyIcon";
import { detectContactType, CONTACT_LABELS } from "@/lib/contact";

export default function RegisterPage() {
  const router = useRouter();
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [contactTaken, setContactTaken] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const contactType = contact.trim() ? detectContactType(contact) : null;

  useEffect(() => {
    setContactTaken(false);
    if (!contact.trim()) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/auth/check-contact?contact=${encodeURIComponent(contact)}`);
      const data = await res.json();
      setContactTaken(data.taken);
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [contact]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!contact.trim()) { setError("Введите email, телефон или @telegram"); return; }
    if (!password.trim()) { setError("Введите пароль"); return; }
    if (password.length < 6) { setError("Пароль должен быть не менее 6 символов"); return; }
    if (!confirm.trim()) { setError("Повторите пароль"); return; }
    if (password !== confirm) {
      setError("Пароли не совпадают");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка регистрации");
        setLoading(false);
        return;
      }

      router.push("/login?registered=1");
    } catch {
      setError("Ошибка соединения. Попробуйте ещё раз.");
      setLoading(false);
    }
  }

  return (
    <main className="relative flex items-center justify-center min-h-screen px-4 py-8 z-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8 animate-fade-up">
          <div className="animate-float animate-glow-pulse mb-4">
            <KeyIcon size={72} />
          </div>
          <h1 className="text-2xl font-bold text-white">Регистрация</h1>
          <p className="text-[#6b7a99] text-sm mt-1">Создайте аккаунт KeyPay</p>
        </div>

        <div className="glass rounded-2xl p-8 animate-fade-up-delay-1">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-[#6b7a99] mb-1.5 block">
                {contactType ? CONTACT_LABELS[contactType] : "Контакт"}
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="email, телефон или @telegram"
                className={`input-field w-full px-4 py-3 rounded-xl transition-all ${
                  contactTaken ? "border border-red-500 bg-red-500/10" : ""
                }`}
              />
              {contactTaken && (
                <p className="text-red-400 text-xs mt-1.5 font-medium">
                  {contactType === "phone" && "Этот номер уже занят"}
                  {contactType === "email" && "Этот email уже занят"}
                  {contactType === "telegram" && "Этот @username уже занят"}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm text-[#6b7a99] mb-1.5 block">Пароль</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  className="input-field w-full px-4 py-3 pr-11 rounded-xl"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7a99] hover:text-white transition-colors">
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

            <div>
              <label className="text-sm text-[#6b7a99] mb-1.5 block">Повторите пароль</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="input-field w-full px-4 py-3 pr-11 rounded-xl"
                />
                <button type="button" onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7a99] hover:text-white transition-colors">
                  {showConfirm ? (
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
              disabled={loading || contactTaken}
              className="btn-primary w-full py-3 rounded-xl mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Создаём аккаунт..." : "Зарегистрироваться"}
            </button>
          </form>

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
