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

        <h1 className="text-5xl font-bold mb-4 animate-fade-up-delay-1 tracking-tight">
          <span className="gradient-text">Key</span>
          <span className="text-white">Pay</span>
        </h1>

        <p className="text-lg text-[#6b7a99] mb-10 animate-fade-up-delay-2 leading-relaxed">
          Покупай ключи доступа без Telegram.
          <br />
          Регистрируйся, оплачивай и подключайся.
        </p>

        <div className="flex gap-4 animate-fade-up-delay-3">
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
            Регистрация
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full animate-fade-up-delay-3">
        {[
          { icon: "⚡", title: "Быстро", desc: "Высокая скорость, минимальные задержки" },
          { icon: "🔑", title: "Просто", desc: "Купи ключ и сразу подключайся" },
          { icon: "🌍", title: "Везде", desc: "Работает на всех устройствах" },
        ].map((f) => (
          <div key={f.title} className="glass rounded-2xl p-6 text-center">
            <div className="text-3xl mb-3">{f.icon}</div>
            <div className="font-semibold text-white mb-1">{f.title}</div>
            <div className="text-sm text-[#6b7a99]">{f.desc}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
