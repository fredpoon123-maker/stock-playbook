import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { NavLinks } from "@/components/NavLinks";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "投資 Playbook",
  description: "個人投資信念、注碼、驅動因子、買入價位追蹤",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <header className="pb-header">
          <div className="mx-auto max-w-6xl px-5">
            <Link href="/" className="inline-block">
              <h1>📈 投資 Playbook</h1>
            </Link>
            <div className="pb-sub">信念 · 注碼 · 驅動因子 · 買入價位 · 催化劑 · 前景</div>
            <div className="pb-meta">
              僅供個人研究/教育，非投資建議。即時價/市值來自 FMP；基本面/SA Premium 由用戶手動輸入。
            </div>
          </div>
        </header>
        <nav className="pb-nav">
          <div className="mx-auto max-w-6xl px-5">
            <NavLinks />
          </div>
        </nav>
        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6">
          {children}
        </main>
        <footer className="border-t py-6 text-center text-xs" style={{ borderColor: "var(--line)", color: "var(--muted)" }}>
          僅供個人研究/教育，非投資建議
        </footer>
      </body>
    </html>
  );
}
