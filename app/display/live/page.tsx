"use client";
import { useState, useEffect, useRef } from "react";
import StatusBar from "@/components/display/StatusBar";
import MessageList from "@/components/display/MessageList";
import VoiceCapture from "@/components/display/VoiceCapture";

type Msg = { role: "customer"|"staff"; original: string; translated?: string };

export default function DisplayLive(){
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [err, setErr] = useState("");

  // エラーは3秒後に自動フェードアウト
  useEffect(()=>{ if(err){ const t=setTimeout(()=>setErr(""),3000); return ()=>clearTimeout(t);} },[err]);

  // 会話コンテナ参照（「最新へ」スクロール用）
  const convRef = useRef<HTMLDivElement>(null);
  const scrollToLatest = () => {
    const el = convRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  async function handleRecognized(text: string){
    setMessages(prev => [...prev, { role:"customer", original:text }]);
    try {
      const target = (localStorage.getItem("targetLang") || "EN").toUpperCase();
      const r = await fetch("/api/v1/translate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, target })
      });
      const j = await r.json();
      const tr = j?.translation || "";
      setMessages(prev => {
        const idx = prev.length - 1; const next = [...prev];
        next[idx] = { ...next[idx], translated: tr };
        return next;
      });
    } catch(e:any) { setErr(e?.message || "translation_failed"); }
  }

  return (
    <main className="min-h-screen p-6 md:p-10 max-w-4xl mx-auto">
      {/* 画面が小さい/縦向き時の警告（CSSで制御） */}
      <div className="size-warning">画面が小さすぎます。タブレット横向きを推奨します。</div>
      <div className="orientation-warning">端末を横向きにしてください。</div>

      <div className="mb-4">
        <StatusBar listening={listening} />
      </div>

      {/* 会話コンテナ（testids） */}
      <div ref={convRef} data-testid="conversation-container" className="rounded-2xl bg-white shadow-soft p-4 mb-2" style={{maxHeight:"60vh", overflowY:"auto"}}>
        <MessageList items={messages} />
      </div>
      <div style={{display:"flex", justifyContent:"flex-end"}}>
        <button data-testid="btn-scroll-to-latest" className="btn-scroll-latest" onClick={scrollToLatest}>最新へ</button>
      </div>

      <div className="flex items-center gap-4 mt-4">
        <VoiceCapture onText={handleRecognized} setListening={setListening} onError={(e)=>setErr(String(e))} />
      </div>

      {/* エラーオーバーレイ */}
      {err && (
        <div className="error-overlay" data-testid="error-overlay" role="status" aria-live="assertive">
          <div className="error-icon">⚠️</div>
          <div className="error-title" data-testid="error-title-ja">エラーが発生しました</div>
          <div className="error-message" data-testid="error-message-ja">{err}</div>
          <div className="error-ready">数秒後に自動で閉じます</div>
        </div>
      )}
    </main>
  );
}