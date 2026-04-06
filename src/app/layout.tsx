import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VPN — Личный кабинет",
  description: "Быстрый и надёжный VPN. Подключайтесь без Telegram.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
