import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "あんしんディスプレイ",
  description: "かんたん・あんしんな音声翻訳ディスプレイ（7日トライアル）",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}