"use client";
import { useState } from "react";
import Link from "next/link";
import { CookieBanner } from "@/components/CookieBanner";
import { PinLock } from "@/components/security/PinLock";

export default function Display(){
  const [showPin,setShowPin] = useState(false);

  function setLangAndGo(code: string){
    try { localStorage.setItem("targetLang", code.toUpperCase()); } catch {}
    location.href = "/display/live";
  }

  return (
    <main className="welcome-container">
      <button className="settings-button" data-testid="btn-settings" aria-label="settings" onClick={()=>setShowPin(true)}>笞呻ｸ・/button>
      {showPin && <PinLock><div className="sr-only">PIN OK</div></PinLock>}

      <h1 className="welcome-title" data-testid="welcome-language-prompt">Please select your language</h1>

      <div className="language-cards">
        <button className="language-card english" data-testid="lang-en" onClick={()=>setLangAndGo("EN")} aria-label="English">
          <h2>English</h2>
          <p>If you have any questions,<br/>I'm here to help.</p>
          <span className="tap-hint">痩 Tap here</span>
        </button>

        <button className="language-card korean" data-testid="lang-ko" onClick={()=>setLangAndGo("KO")} aria-label="﨑懋ｵｭ・ｴ">
          <h2>﨑懋ｵｭ・ｴ</h2>
          <p>・壱ｬｸ・ｴ ・溢愍・罹ｩｴ<br/>・・凰・罹ｦｬ・・ｵ・壱共.</p>
          <span className="tap-hint">痩 ・夋・/span>
        </button>

        <button className="language-card chinese" data-testid="lang-zh" onClick={()=>setLangAndGo("ZH")} aria-label="荳ｭ譁・>
          <h2>荳ｭ譁・/h2>
          <p>螯よ怏莉ｻ菴暮琉鬚假ｼ・br/>謌台ｼ壻ｸｺ謔ｨ謠蝉ｾ帛ｸｮ蜉ｩ縲・/p>
          <span className="tap-hint">痩 轤ｹ蜃ｻ</span>
        </button>
      </div>

      <div className="footer-logo" data-testid="welcome-logo-footer">縺ゅｓ縺励ｓ繝・ぅ繧ｹ繝励Ξ繧､</div>

      <div style={{marginTop:16, display:"flex", gap:12}}>
        <Link href="/terms" className="underline text-sm">蛻ｩ逕ｨ隕冗ｴ・/Link>
        <Link href="/privacy" className="underline text-sm">繝励Λ繧､繝舌す繝ｼ</Link>
        <Link href="/legal" className="underline text-sm">迚ｹ蝠・ｳ・/Link>
      </div>

      <CookieBanner />
    </main>
  );
}