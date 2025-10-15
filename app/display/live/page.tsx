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

  // 繧ｨ繝ｩ繝ｼ縺ｯ3遘貞ｾ後↓閾ｪ蜍輔ヵ繧ｧ繝ｼ繝峨い繧ｦ繝・  useEffect(()=>{ if(err){ const t=setTimeout(()=>setErr(""),3000); return ()=>clearTimeout(t);} },[err]);

  // 莨夊ｩｱ繧ｳ繝ｳ繝・リ蜿ら・・医梧怙譁ｰ縺ｸ縲阪せ繧ｯ繝ｭ繝ｼ繝ｫ逕ｨ・・  const convRef = useRef<HTMLDivElement>(null);
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
      {/* 逕ｻ髱｢縺悟ｰ上＆縺・邵ｦ蜷代″譎ゅ・隴ｦ蜻奇ｼ・SS縺ｧ蛻ｶ蠕｡・・*/}
      <div className="size-warning">逕ｻ髱｢縺悟ｰ上＆縺吶℃縺ｾ縺吶ゅち繝悶Ξ繝・ヨ讓ｪ蜷代″繧呈耳螂ｨ縺励∪縺吶・/div>
      <div className="orientation-warning">遶ｯ譛ｫ繧呈ｨｪ蜷代″縺ｫ縺励※縺上□縺輔＞縲・/div>

      <div className="mb-4">
        <StatusBar listening={listening} />
      </div>

      {/* 莨夊ｩｱ繧ｳ繝ｳ繝・リ・・estids・・*/}
      <div ref={convRef} data-testid="conversation-container" className="rounded-2xl bg-white shadow-soft p-4 mb-2" style={{maxHeight:"60vh", overflowY:"auto"}}>
        <MessageList items={messages} />
      </div>
      <div style={{display:"flex", justifyContent:"flex-end"}}>
        <button data-testid="btn-scroll-to-latest" className="btn-scroll-latest" onClick={scrollToLatest}>譛譁ｰ縺ｸ</button>
      </div>

      <div className="flex items-center gap-4 mt-4">
        <VoiceCapture onText={handleRecognized} setListening={setListening} onError={(e)=>setErr(String(e))} />
      </div>

      {/* 繧ｨ繝ｩ繝ｼ繧ｪ繝ｼ繝舌・繝ｬ繧､ */}
      {err && (
        <div className="error-overlay" data-testid="error-overlay" role="status" aria-live="assertive">
          <div className="error-icon">笞・・/div>
          <div className="error-title" data-testid="error-title-ja">繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆</div>
          <div className="error-message" data-testid="error-message-ja">{err}</div>
          <div className="error-ready">謨ｰ遘貞ｾ後↓閾ｪ蜍輔〒髢峨§縺ｾ縺・/div>
        </div>
      )}
    </main>
  );
}