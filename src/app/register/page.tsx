"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import KeyIcon from "@/components/KeyIcon";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phone, setPhone] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Пароли не совпадают");
      return;
    }
    if (password.length < 6) {
      setError("Пароль должен быть не менее 6 символов");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, phone, telegramUsername }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Ошибка регистрации");
      return;
    }

    router.push("/login?registered=1");
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
              <label className="text-sm text-[#6b7a99] mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
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
                placeholder="Минимум 6 символов"
                required
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

            {/* Divider */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[#6b7a99] text-xs">для уведомлений (необязательно)</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <div>
              <label className="text-sm text-[#6b7a99] mb-1.5 block">
                Номер телефона
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 999 000 00 00"
                className="input-field w-full px-4 py-3 rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm text-[#6b7a99] mb-1.5 block">
                Telegram username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7a99]">@</span>
                <input
                  type="text"
                  value={telegramUsername}
                  onChange={(e) =>
                    setTelegramUsername(e.target.value.replace(/^@/, ""))
                  }
                  placeholder="username"
                  className="input-field w-full pl-8 pr-4 py-3 rounded-xl"
                />
              </div>
              <p className="text-[#6b7a99] text-xs mt-1.5">
                Будем отправлять чеки об оплате в Telegram
              </p>
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
