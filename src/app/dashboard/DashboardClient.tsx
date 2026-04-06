"use client";

import { useState, useEffect, useCallback } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import KeyIcon from "@/components/KeyIcon";

interface SubscriptionInfo {
  active: boolean;
  expiringDate: string | null;
  accessKey: string | null;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function DashboardClient({ email }: { email: string }) {
  const [info, setInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchSubscription = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/subscription");
    if (res.ok) setInfo(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  async function copyKey() {
    if (!info?.accessKey) return;
    await navigator.clipboard.writeText(info.accessKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function cancelSubscription() {
    if (!confirm("Отменить подписку? Ключ будет удалён.")) return;
    setCancelling(true);
    await fetch("/api/subscription", { method: "DELETE" });
    await fetchSubscription();
    setCancelling(false);
  }

  return (
    <main className="relative flex flex-col items-center min-h-screen px-4 pt-12 pb-16 z-10">
      {/* Header */}
      <div className="w-full max-w-lg flex items-center justify-between mb-10 animate-fade-up">
        <div className="flex items-center gap-3">
          <KeyIcon size={36} />
          <span className="font-bold text-lg gradient-text">KeyPay</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#6b7a99] text-sm hidden sm:block">{email}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="glass px-4 py-2 rounded-xl text-sm text-[#6b7a99] hover:text-white hover:bg-white/10 transition-all"
          >
            Выйти
          </button>
        </div>
      </div>

      <div className="w-full max-w-lg flex flex-col gap-4">
        {/* Subscription status */}
        <div className="glass rounded-2xl p-6 animate-fade-up-delay-1">
          {loading ? (
            <div className="flex items-center gap-3 text-[#6b7a99]">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              Загрузка...
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#6b7a99] text-sm font-medium uppercase tracking-wider">
                  Статус подписки
                </span>
                {info?.active ? (
                  <span className="flex items-center gap-1.5 text-green-400 font-semibold text-sm">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Активна
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[#6b7a99] text-sm">
                    <span className="w-2 h-2 bg-gray-500 rounded-full" />
                    Не активна
                  </span>
                )}
              </div>

              {info?.active && info.expiringDate && (
                <div className="text-white">
                  Истекает:{" "}
                  <span className="font-semibold text-[#60a5fa]">
                    {formatDate(info.expiringDate)}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* VPN Key */}
        {info?.accessKey && (
          <div className="glass rounded-2xl p-6 animate-fade-up-delay-1">
            <div className="text-[#6b7a99] text-sm font-medium uppercase tracking-wider mb-3">
              Ваш ключ доступа
            </div>
            <div className="bg-black/30 rounded-xl p-3 font-mono text-xs text-[#60a5fa] break-all mb-3">
              {showKey ? info.accessKey : "vless://••••••••••••••••••••••••"}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowKey((v) => !v)}
                className="glass px-4 py-2 rounded-xl text-sm text-[#6b7a99] hover:text-white hover:bg-white/10 transition-all flex-1"
              >
                {showKey ? "Скрыть" : "Показать"}
              </button>
              <button
                onClick={copyKey}
                className="btn-primary px-4 py-2 rounded-xl text-sm flex-1"
              >
                {copied ? "Скопировано ✓" : "Скопировать"}
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 animate-fade-up-delay-2">
          <Link
            href="/plans"
            className="btn-primary flex-1 py-3 rounded-xl text-center text-sm font-semibold"
          >
            {info?.active ? "Продлить" : "Купить подписку"}
          </Link>
          <Link
            href="/instructions"
            className="glass flex-1 py-3 rounded-xl text-center text-sm font-semibold text-[#60a5fa] hover:bg-white/10 transition-all"
          >
            Инструкция
          </Link>
        </div>

        {info?.active && (
          <button
            onClick={cancelSubscription}
            disabled={cancelling}
            className="text-sm text-red-400/70 hover:text-red-400 transition-colors text-center py-2 animate-fade-up-delay-2 disabled:opacity-50"
          >
            {cancelling ? "Отменяем..." : "Отменить подписку"}
          </button>
        )}
      </div>
    </main>
  );
}
