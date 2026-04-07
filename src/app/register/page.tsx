"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import KeyIcon from "@/components/KeyIcon";
import { detectContactType, CONTACT_LABELS, CONTACT_ICONS } from "@/lib/contact";

export default function RegisterPage() {
  const router = useRouter();
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
              <label className="text-sm text-[#6b7a99] mb-1.5 flex items-center gap-2">
                {contactType
                  ? <span>{CONTACT_ICONS[contactType]} {CONTACT_LABELS[contactType]}</span>
                  : "Контакт"}
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="email, +79001234567 или @telegram"
                required
                className={`input-field w-full px-4 py-3 rounded-xl transition-all ${
                  contactTaken ? "border border-red-500 bg-red-500/10" : ""
                }`}
              />
              {contactTaken ? (
                <p className="text-red-400 text-xs mt-1.5">
                  Пользователь с таким контактом уже зарегистрирован
                </p>
              ) : (
                <p className="text-[#6b7a99] text-xs mt-1.5">
                  Email, номер телефона или Telegram @username
                </p>
              )}
            </div>

            <div>
              <label className="text-sm text-[#6b7a99] mb-1.5 block">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                required
                minLength={6}
                className="input-field w-full px-4 py-3 rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm text-[#6b7a99] mb-1.5 block">Повторите пароль</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                className="input-field w-full px-4 py-3 rounded-xl"
              />
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
