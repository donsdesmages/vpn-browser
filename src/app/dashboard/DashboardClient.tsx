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
  const [copied, setCopied] = useState(false);
  const [keyExpanded, setKeyExpanded] = useState(false);
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
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [polling, setPolling] = useState(false);

  const fetchSubscription = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/subscription");
    if (res.ok) setInfo(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSubscription();
    if (new URLSearchParams(window.location.search).get("payment") === "success") {
      setPaymentSuccess(true);
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [fetchSubscription]);

  // Полинг ключа после оплаты — webhook может прийти с задержкой
  useEffect(() => {
    if (!paymentSuccess || info?.accessKey) return;
    setPolling(true);
    let tries = 0;
    const interval = setInterval(async () => {
      tries++;
      const res = await fetch("/api/subscription");
      if (res.ok) {
        const data = await res.json();
        setInfo(data);
        if (data.accessKey || tries >= 10) {
          clearInterval(interval);
          setPolling(false);
        }
      } else if (tries >= 10) {
        clearInterval(interval);
        setPolling(false);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [paymentSuccess, info?.accessKey]);

  async function copyKey() {
    if (!info?.accessKey) return;
    try {
      await navigator.clipboard.writeText(info.accessKey);
    } catch {
      // Fallback для Safari / HTTP
      const el = document.createElement("textarea");
      el.value = info.accessKey;
      el.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
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

      {/* Toast */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        copied ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}>
        <div className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium text-white"
          style={{ background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.4)", backdropFilter: "blur(12px)" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Ключ скопирован
        </div>
      </div>
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

        {/* Баннер успешной оплаты */}
        {paymentSuccess && (
          <div className="rounded-2xl p-5 animate-fade-up" style={{
            background: "linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(16,185,129,0.1) 100%)",
            border: "1px solid rgba(34,197,94,0.4)",
            boxShadow: "0 0 30px rgba(34,197,94,0.15)"
          }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span className="text-green-400 font-bold text-lg">Оплата прошла успешно!</span>
            </div>
            <p className="text-green-400/70 text-sm ml-11">
              {info?.accessKey ? "Ваш ключ доступа активирован и готов к использованию" : polling ? "Активируем ключ доступа..." : "Ключ скоро появится в кабинете"}
            </p>
            {polling && !info?.accessKey && (
              <div className="flex items-center gap-2 ml-11 mt-2">
                <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-green-400/60 text-xs">Обычно занимает несколько секунд</span>
              </div>
            )}
          </div>
        )}

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
                <span className="text-white font-semibold">
                  Подписка
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
          <div className={`rounded-2xl p-6 animate-fade-up-delay-1 transition-all ${paymentSuccess
            ? "border border-blue-500/40 bg-blue-500/5"
            : "glass"}`}
            style={paymentSuccess ? { boxShadow: "0 0 40px rgba(59,130,246,0.15)" } : {}}>
            <div className="text-[#6b7a99] text-sm font-medium uppercase tracking-wider mb-3">
              {paymentSuccess ? "Ваш ключ готов" : "Ваш ключ доступа"}
            </div>
            <div className="relative bg-black/30 rounded-xl p-3 pr-10">
              <div className={`text-xs text-[#60a5fa] ${keyExpanded ? "break-all" : "truncate"}`}>
                {info.accessKey}
              </div>
              <button
                onClick={copyKey}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg text-[#6b7a99] hover:text-white hover:bg-white/10 transition-all"
                title="Скопировать ключ"
              >
                {copied ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                )}
              </button>
            </div>
            <button
              onClick={() => setKeyExpanded((v) => !v)}
              className="flex items-center justify-center gap-1 w-full py-1 text-[#6b7a99] hover:text-white transition-colors"
            >
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className={`transition-transform duration-200 ${keyExpanded ? "rotate-180" : ""}`}
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
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

        {/* Telegram + Email link blocks */}
        <div className="flex flex-col gap-3 animate-fade-up-delay-2">

          {/* Telegram */}
          {linked ? (
            <div className="glass rounded-2xl px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#229ed9]/15 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#229ed9">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 13.617l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm">Telegram привязан</div>
                <div className="text-[#6b7a99] text-xs mt-0.5">Чеки об оплате приходят в бот</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          ) : linkData ? (
            <div className="glass rounded-2xl px-5 py-4 flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#229ed9]/15 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#229ed9">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 13.617l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-white font-medium text-sm">Привязать Telegram</div>
                  <div className="text-[#6b7a99] text-xs mt-0.5">Откройте бота и отправьте команду</div>
                </div>
              </div>
              <a
                href={linkData.deepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full py-2.5 rounded-xl text-center text-sm font-semibold"
              >
                Открыть @{linkData.botUsername}
              </a>
            </div>
          ) : (
            <button
              onClick={handleLinkTelegram}
              className="glass rounded-2xl px-5 py-4 flex items-center gap-4 w-full hover:bg-white/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#229ed9]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#229ed9]/20 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#229ed9">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 13.617l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <div className="text-white font-medium text-sm">Привязать Telegram</div>
                <div className="text-[#6b7a99] text-xs mt-0.5">Получайте чеки об оплате в бот</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7a99" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-white transition-colors">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          )}

          {/* Email */}
          {contactType !== "email" && (
            linkedEmailState ? (
              <div className="glass rounded-2xl px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <polyline points="2,4 12,13 22,4"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium text-sm">Email привязан</div>
                  <div className="text-[#6b7a99] text-xs mt-0.5 truncate">{linkedEmailState}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            ) : showEmailForm ? (
              <div className="glass rounded-2xl px-5 py-4 flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <polyline points="2,4 12,13 22,4"/>
                    </svg>
                  </div>
                  <div className="text-white font-medium text-sm">Введите email</div>
                </div>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field w-full px-4 py-2.5 rounded-xl text-sm"
                />
                {emailError && (
                  <div className="text-red-400 text-xs">{emailError}</div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowEmailForm(false); setEmailError(""); }}
                    className="glass flex-1 py-2.5 rounded-xl text-sm text-[#6b7a99] hover:text-white transition-all"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleLinkEmail}
                    disabled={emailLinking || !emailInput.trim()}
                    className="btn-primary flex-1 py-2.5 rounded-xl text-sm disabled:opacity-50"
                  >
                    {emailLinking ? "Сохраняем..." : "Привязать"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowEmailForm(true)}
                className="glass rounded-2xl px-5 py-4 flex items-center gap-4 w-full hover:bg-white/5 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <polyline points="2,4 12,13 22,4"/>
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white font-medium text-sm">Привязать Email</div>
                  <div className="text-[#6b7a99] text-xs mt-0.5">Для входа по коду подтверждения</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7a99" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-white transition-colors">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            )
          )}

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
