"use client";
import { useEffect, useState } from "react";

const PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || "4242";

export function PinLock({ children }: { children?: React.ReactNode }){
  const [pin,setPin] = useState("");
  const [ok,setOk] = useState(false);

  useEffect(()=>{
    // 直前に解除済ならスキップ（セッション内）
    try { if (sessionStorage.getItem("pin_ok")==="1") setOk(true); } catch {}
  },[]);

  function submit(){
    if (pin === PIN) {
      setOk(true);
      try { sessionStorage.setItem("pin_ok","1"); } catch {}
    } else {
      alert("PINが違います");
    }
  }

  if (ok) return <>{children}</>;

  return (
    <div className="pinlock-overlay" data-testid="pinlock">
      <div className="pinlock-card">
        <h2 className="pinlock-title">管理設定（PIN）</h2>
        <input
          autoFocus
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          className="pinlock-input"
          placeholder="4桁のPIN"
          value={pin} onChange={(e)=>setPin((e.target as HTMLInputElement).value)}
          onKeyDown={(e)=>{ if(e.key==="Enter") submit(); }}
        />
        <div className="pinlock-actions">
          <button className="pinlock-btn" onClick={submit}>解除</button>
          <button className="pinlock-btn" onClick={()=>{ setPin(""); }}>クリア</button>
        </div>
        <p className="pinlock-help">※ 既定は 4242 ／ 環境変数 NEXT_PUBLIC_ADMIN_PIN で変更できます。</p>
      </div>
    </div>
  );
}