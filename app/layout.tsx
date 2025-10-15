import "./prd.css";
import { Noto_Sans_JP } from "next/font/google";
import React from "react";

const noto = Noto_Sans_JP({ subsets: ["latin"], weight: ["400","700"] });

export const metadata = {
  title: "縺ゅｓ縺励ｓ繝・ぅ繧ｹ繝励Ξ繧､",
  description: "繝ｪ繧｢繝ｫ繧ｿ繧､繝騾夊ｨｳ繝・ぅ繧ｹ繝励Ξ繧､",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  return (
    <html lang="ja">
      <head>
        {gaId ? (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script dangerouslySetInnerHTML={{__html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}} />
          </>
        ) : null}
      </head>
      <body className={noto.className}>
        {children}
      </body>
    </html>
  );
}