"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { logout } from "@/app/actions";
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

export default function DashboardClient({
  email,
  telegramLinked,
  contactType,
  linkedEmail,
}: {
  email: string;
  telegramLinked: boolean;
  contactType: string;
  linkedEmail: string | null;
}) {
  const [info, setInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [linked, setLinked] = useState(telegramLinked);
  const [linkData, setLinkData] = useState<{
    deepLink: string;
    botUsername: string;
  } | null>(null);
  const [linkedEmailState, setLinkedEmailState] = useState<string | null>(linkedEmail);
  const [emailInput, setEmailInput] = useState("");
  const [emailLinking, setEmailLinking] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);

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

  async function handleLinkEmail() {
    setEmailError("");
    setEmailLinking(true);
    try {
      const res = await fetch("/api/profile/email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEmailError(data.error || "Ошибка");
      } else {
        setLinkedEmailState(emailInput.trim().toLowerCase());
        setShowEmailForm(false);
        setEmailInput("");
      }
    } catch {
      setEmailError("Ошибка соединения");
    } finally {
      setEmailLinking(false);
    }
  }

  async function handleLinkTelegram() {
    const res = await fetch("/api/link-telegram");
    const data = await res.json();
    if (data.alreadyLinked) {
      setLinked(true);
      return;
    }
    setLinkData({ deepLink: data.deepLink, botUsername: data.botUsername });
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
            onClick={() => startTransition(() => logout())}
            disabled={isPending}
            className="glass px-4 py-2 rounded-xl text-sm text-[#6b7a99] hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
          >
            {isPending ? "Выходим..." : "Выйти"}
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

        {/* Telegram Link */}
        {!linked && (
          <div className="glass rounded-2xl p-4 animate-fade-up-delay-2">
            {linkData ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-[#93c5fd]">
                  Откройте бота и отправьте команду для привязки Telegram:
                </p>
                <a
                  href={linkData.deepLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full py-2.5 rounded-xl text-center text-sm font-semibold"
                >
                  Открыть @{linkData.botUsername}
                </a>
                <p className="text-[#6b7a99] text-xs text-center">
                  Telegram нужен для получения чеков об оплате
                </p>
              </div>
            ) : (
              <button
                onClick={handleLinkTelegram}
                className="w-full flex items-center justify-center gap-2 text-sm text-[#6b7a99] hover:text-[#93c5fd] transition-colors py-1"
              >
                Привязать Telegram для чеков
              </button>
            )}
          </div>
        )}

        {linked && (
          <div className="text-center text-sm text-green-400/70 animate-fade-up-delay-2">
            ✅ Telegram привязан — чеки будут приходить в бот
          </div>
        )}

        {/* Email link block — для телефонных и telegram аккаунтов */}
        {contactType !== "email" && (
          <div className="glass rounded-2xl p-4 animate-fade-up-delay-2">
            {linkedEmailState ? (
              <div className="text-center text-sm text-green-400/70">
                ✅ Email привязан: <span className="text-white">{linkedEmailState}</span>
              </div>
            ) : showEmailForm ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-[#93c5fd]">Введите email для входа по коду:</p>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field w-full px-4 py-2.5 rounded-xl text-sm"
                />
                {emailError && (
                  <div className="text-red-400 text-xs text-center">{emailError}</div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowEmailForm(false); setEmailError(""); }}
                    className="glass flex-1 py-2 rounded-xl text-sm text-[#6b7a99] hover:text-white transition-all"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleLinkEmail}
                    disabled={emailLinking || !emailInput.trim()}
                    className="btn-primary flex-1 py-2 rounded-xl text-sm disabled:opacity-50"
                  >
                    {emailLinking ? "Сохраняем..." : "Привязать"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowEmailForm(true)}
                className="w-full flex items-center justify-center gap-2 text-sm text-[#6b7a99] hover:text-[#93c5fd] transition-colors py-1"
              >
                Привязать email для входа по коду
              </button>
            )}
          </div>
        )}

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
