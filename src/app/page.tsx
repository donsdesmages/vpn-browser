import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import KeyIcon from "@/components/KeyIcon";

export default async function HomePage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-4 overflow-hidden z-10">
      {/* Hero */}
      <div className="flex flex-col items-center text-center max-w-xl">
        {/* Animated key */}
        <div className="mb-10 animate-fade-up">
          <div className="animate-float animate-glow-pulse">
            <KeyIcon size={160} />
          </div>
        </div>

        <h1 className="text-6xl font-bold mb-4 animate-fade-up-delay-1 tracking-tight">
          <span className="gradient-text">Key</span>
          <span className="text-white">Pay</span>
        </h1>

        <p className="text-lg text-[#6b7a99] mb-10 animate-fade-up-delay-2 leading-relaxed">
          Твой ключ к безграничному доступу в сети
        </p>

        <div className="flex flex-col items-center gap-3 mt-14 animate-fade-up-delay-3">
          <div className="flex gap-4">
            <Link
              href="/login"
              className="btn-primary px-8 py-3 rounded-xl text-base inline-block"
            >
              Войти
            </Link>
            <Link
              href="/register"
              className="glass px-8 py-3 rounded-xl text-base text-[#60a5fa] font-semibold hover:bg-white/10 transition-all duration-300 inline-block"
            >
              Зарегистрироваться
            </Link>
          </div>
          <p className="text-lg text-[#6b7a99]">
            Регистрируйся, оплачивай и подключайся
          </p>
        </div>

      </div>

      {/* Features */}
      <div className="mt-10 max-w-3xl w-full animate-fade-up-delay-3">
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            ),
            title: "Быстро", desc: "Высокая скорость, минимальные задержки",
          },
          {
            icon: (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            ),
            title: "Просто", desc: "Купи ключ и сразу подключайся",
          },
          {
            icon: (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            ),
            title: "Везде", desc: "Работает на всех устройствах",
          },
        ].map((f) => (
          <div key={f.title} className="glass rounded-xl p-3 text-center">
            <div className="flex justify-center mb-1.5">{f.icon}</div>
            <div className="font-semibold text-white text-sm mb-0.5">{f.title}</div>
            <div className="text-xs text-[#6b7a99] leading-snug">{f.desc}</div>
          </div>
        ))}
      </div>
      </div>
    </main>
  );
}
