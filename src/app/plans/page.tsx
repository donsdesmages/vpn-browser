"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import KeyIcon from "@/components/KeyIcon";

const PLANS = [
  { id: "week", label: "Неделя", price: 60, desc: "7 дней" },
  { id: "month", label: "Месяц", price: 299, desc: "30 дней", popular: true },
  { id: "quarter", label: "3 месяца", price: 599, desc: "90 дней" },
] as const;

export default function PlansPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function buyPlan(planId: string) {
    setError("");
    setLoading(planId);

    const res = await fetch("/api/payment/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });

    if (res.status === 401) {
      router.push("/login");
      return;
    }

    const data = await res.json();
    setLoading(null);

    if (!res.ok) {
      setError(data.error || "Ошибка создания платежа");
      return;
    }

    window.location.href = data.confirmationUrl;
  }

  return (
    <main className="relative flex flex-col items-center min-h-screen px-4 pt-12 pb-16 z-10">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 animate-fade-up">
          <Link href="/dashboard" className="flex items-center gap-3">
            <KeyIcon size={36} />
            <span className="font-bold text-lg gradient-text">KeyPay</span>
          </Link>
          <Link
            href="/dashboard"
            className="glass px-4 py-2 rounded-xl text-sm text-[#6b7a99] hover:text-white hover:bg-white/10 transition-all"
          >
            ← Назад
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2 animate-fade-up">Тарифы</h1>
        <p className="text-[#6b7a99] mb-8 animate-fade-up">Выберите подходящий план</p>

        {error && (
          <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl py-3 mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLANS.map((plan, i) => (
            <div
              key={plan.id}
              className={`glass rounded-2xl p-6 flex flex-col items-center text-center relative animate-fade-up ${"popular" in plan && plan.popular ? "border-blue-500/40 ring-1 ring-blue-500/30" : ""}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {"popular" in plan && plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Популярный
                </div>
              )}

              <div className="text-[#6b7a99] text-sm mb-2">{plan.desc}</div>
              <div className="text-white text-xl font-bold mb-1">{plan.label}</div>
              <div className="gradient-text text-4xl font-bold mb-6">
                {plan.price} ₽
              </div>

              <button
                onClick={() => buyPlan(plan.id)}
                disabled={loading !== null}
                className="btn-primary w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading === plan.id ? "..." : "Купить"}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-[#6b7a99] text-xs mt-8 animate-fade-up-delay-3">
          Оплата через ЮKassa · Тестовая карта: 4111 1111 1111 1111
        </p>
      </div>
    </main>
  );
}
