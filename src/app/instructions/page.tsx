"use client";

import { useState } from "react";
import Link from "next/link";
import KeyIcon from "@/components/KeyIcon";

const TABS = ["iOS", "Android", "Windows", "macOS"] as const;
type Tab = (typeof TABS)[number];

const STEPS: Record<Tab, { step: string; desc: string }[]> = {
  iOS: [
    { step: "1. Скачайте Streisand", desc: "App Store → Streisand (бесплатно)" },
    { step: "2. Скопируйте ключ", desc: "В кабинете нажмите «Скопировать»" },
    { step: "3. Добавьте конфиг", desc: "Streisand → + → Вставить из буфера" },
    { step: "4. Подключитесь", desc: "Нажмите на переключатель" },
  ],
  Android: [
    { step: "1. Скачайте v2rayNG", desc: "Google Play → v2rayNG (бесплатно)" },
    { step: "2. Скопируйте ключ", desc: "В кабинете нажмите «Скопировать»" },
    { step: "3. Добавьте конфиг", desc: "v2rayNG → + → Импорт из буфера" },
    { step: "4. Подключитесь", desc: "Нажмите кнопку запуска" },
  ],
  Windows: [
    { step: "1. Скачайте Hiddify", desc: "hiddify.com → Windows версия" },
    { step: "2. Скопируйте ключ", desc: "В кабинете нажмите «Скопировать»" },
    { step: "3. Добавьте конфиг", desc: "Hiddify → New profile → Вставьте ссылку" },
    { step: "4. Подключитесь", desc: "Нажмите Connect" },
  ],
  macOS: [
    { step: "1. Скачайте Hiddify", desc: "hiddify.com → macOS версия" },
    { step: "2. Скопируйте ключ", desc: "В кабинете нажмите «Скопировать»" },
    { step: "3. Добавьте конфиг", desc: "Hiddify → New profile → Вставьте ссылку" },
    { step: "4. Подключитесь", desc: "Нажмите Connect" },
  ],
};

export default function InstructionsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("iOS");

  return (
    <main className="relative flex flex-col items-center min-h-screen px-4 pt-12 pb-16 z-10">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 animate-fade-up">
          <Link href="/dashboard" className="flex items-center gap-3">
            <KeyIcon size={36} />
            <span className="font-bold text-lg gradient-text">VPN Кабинет</span>
          </Link>
          <Link
            href="/dashboard"
            className="glass px-4 py-2 rounded-xl text-sm text-[#6b7a99] hover:text-white hover:bg-white/10 transition-all"
          >
            ← Назад
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white mb-8 animate-fade-up">Как подключиться</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 glass rounded-xl p-1 animate-fade-up-delay-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg"
                  : "text-[#6b7a99] hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-3 animate-fade-up-delay-2">
          {STEPS[activeTab].map((s, i) => (
            <div key={i} className="glass rounded-xl p-4 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {i + 1}
              </div>
              <div>
                <div className="text-white font-semibold text-sm">{s.step}</div>
                <div className="text-[#6b7a99] text-sm mt-0.5">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 animate-fade-up-delay-3">
          <Link
            href="/dashboard"
            className="btn-primary w-full py-3 rounded-xl text-center block font-semibold"
          >
            Получить ключ
          </Link>
        </div>
      </div>
    </main>
  );
}
