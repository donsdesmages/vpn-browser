"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import KeyIcon from "@/components/KeyIcon";
import { detectContactType, CONTACT_LABELS, CONTACT_ICONS } from "@/lib/contact";

export default function LoginPage() {
  const router = useRouter();
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const contactType = contact.trim() ? detectContactType(contact) : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        contact,
        password,
        redirect: false,
      });

      if (res?.ok) {
        router.push("/dashboard");
      } else {
        setError("Неверный контакт или пароль");
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
                className="input-field w-full px-4 py-3 rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm text-[#6b7a99] mb-1.5 block">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Входим..." : "Войти"}
            </button>
          </form>

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
