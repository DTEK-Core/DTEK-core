import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DTEK Core — Digital Trust Management Platform",
  description:
    "Платформа цифрового доверия. Создаёт цифровую модель доверия организации как слой над SIEM/DLP/EDR.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
