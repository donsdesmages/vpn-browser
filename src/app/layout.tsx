import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KeyPay — Личный кабинет",
  description: "Покупайте и управляйте ключами доступа без Telegram.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className="h-full">
      <body className={`${dmSans.className} min-h-full flex flex-col antialiased`}>{children}</body>
    </html>
  );
}
