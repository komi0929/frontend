"use client";
import React, { useEffect, useRef, useState } from "react";

type Props = {
  onText: (text: string) => void;
  setListening?: (b: boolean) => void;
  onError?: (e: string | Error) => void;
};

export default function VoiceCapture({ onText, setListening, onError }: Props) {
  const [pressed, setPressed] = useState(false);
  const [recording, setRecording] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startTsRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      try { recRef.current?.stop(); } catch {}
      try { streamRef.current?.getTracks()?.forEach(t => t.stop()); } catch {}
    };
  }, []);

  async function begin() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("縺薙・繝悶Λ繧ｦ繧ｶ縺ｯ骭ｲ髻ｳ縺ｫ蟇ｾ蠢懊＠縺ｦ縺・∪縺帙ｓ縲・);
      // 縺吶〒縺ｫ骭ｲ髻ｳ荳ｭ縺ｪ繧臥┌隕・      if (recording) return;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Safari遲蛾・諷ｮ: mimeType 繧貞庄閭ｽ縺ｪ繧芽ｨｭ螳・      let mime = "audio/webm";
      const can = (window as any).MediaRecorder?.isTypeSupported;
      if (typeof can === "function") {
        if (!can(mime)) mime = "audio/webm;codecs=opus";
        if (!can(mime)) mime = ""; // 繝悶Λ繧ｦ繧ｶ莉ｻ縺・      }

      const rec = mime ? new MediaRecorder(stream, { mimeType: mime as any }) : new MediaRecorder(stream);
      recRef.current = rec;
      chunksRef.current = [];
      startTsRef.current = Date.now();

      rec.ondataavailable = (e) => { if (e?.data?.size) chunksRef.current.push(e.data); };
      rec.onstop = async () => {
        try {
          const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
          const durMs = Math.max(0, Date.now() - startTsRef.current);
          const tooShort = durMs < 350;                 // 0.35遘呈悴貅縺ｯ遏ｭ縺吶℃
          const tooSmall = blob.size < 2048;            // 2KB譛ｪ貅縺ｯ遏ｭ縺吶℃縺ｨ縺ｿ縺ｪ縺・
          if (tooShort || tooSmall) {
            onError?.("髻ｳ螢ｰ縺檎洒縺吶℃縺ｾ縺吶ゅｂ縺・ｰ代＠髟ｷ謚ｼ縺励＠縺ｦ隧ｱ縺励※縺上□縺輔＞縲・);
            return; // STT縺ｯ蜻ｼ縺ｰ縺ｪ縺・          }

          const base64 = await blobToBase64(blob);
          const audioBase64 = base64.split(",")[1] || "";
          const mimeType = blob.type || "audio/webm";
          const res = await fetch("/api/v1/stt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audioBase64, mime: mimeType })
          });
          const j = await res.json();
          if (!res.ok) throw new Error(j?.error || "stt_error");
          const text = String(j?.text || "");
          if (!text.trim()) {
            onError?.("髻ｳ螢ｰ繧定ｪ崎ｭ倥〒縺阪∪縺帙ｓ縺ｧ縺励◆縲ゅｂ縺・ｸ蠎ｦ縺願ｩｦ縺励￥縺縺輔＞縲・);
            return;
          }
          onText(text);
        } catch (e:any) {
          onError?.(e?.message || e);
        }
      };

      rec.start();
      setRecording(true);
      setListening?.(true);

      // 髢句ｧ区凾縺ｮ霆ｽ縺・ワ繝励ユ繧｣繝・け
      (navigator as any).vibrate?.(10);
    } catch (e: any) {
      setPressed(false);
      setRecording(false);
      setListening?.(false);
      onError?.(e?.message || e);
    }
  }

  function end() {
    try { recRef.current?.stop(); } catch {}
    try { streamRef.current?.getTracks()?.forEach(t => t.stop()); } catch {}
    setRecording(false);
    setListening?.(false);

    // 邨ゆｺ・凾縺ｮ繝上・繝・ぅ繝・け蠑ｷ蛹厄ｼ育洒縺・ヱ繧ｿ繝ｼ繝ｳ・・    (navigator as any).vibrate?.([0, 20, 40, 20]);
  }

  function onPointerDown(e: React.PointerEvent) {
    e.preventDefault();
    setPressed(true);
    begin();
  }
  function onPointerUp(e: React.PointerEvent) {
    e.preventDefault();
    if (pressed || recording) end();
    setPressed(false);
  }
  function onPointerCancel(e: React.PointerEvent) {
    e.preventDefault();
    if (pressed || recording) end();
    setPressed(false);
  }
  function onPointerLeave(e: React.PointerEvent) {
    // 謚ｼ縺励◆縺ｾ縺ｾ螟悶∈蜃ｺ縺溘ｉ邨ゆｺ・桶縺・ｼ郁ｪ､謫堺ｽ懷ｯｾ遲厄ｼ・    if (pressed || recording) end();
    setPressed(false);
  }

  const active = pressed || recording;

  return (
    <div data-testid="mic-icon" className="mic-wrap" aria-live="polite">
      {/* 骭ｲ髻ｳ荳ｭ縺ｮ襍､縺・ヶ繝ｩ繝ｼ繝ｪ繝ｳ繧ｰ・域・縺･縺九＞・・*/}
      <div className={`mic-ambient ${active ? "on" : ""}`} aria-hidden="true">
        <span className="mic-breath" />
      </div>

      <button
        type="button"
        data-testid="mic-button"
        aria-label={recording ? "骭ｲ髻ｳ荳ｭ" : "髟ｷ謚ｼ縺励〒隧ｱ縺・}
        className={`mic-button ${active ? "active" : ""}`}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onPointerLeave={onPointerLeave}
        onContextMenu={(e)=>e.preventDefault()}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 14 0h-2ZM11 17h2v3h3v2H8v-2h3v-3Z"/>
        </svg>
      </button>
      <div className="mic-help">{recording ? "隧ｱ縺励※縺上□縺輔＞..." : "髟ｷ謚ｼ縺励〒隧ｱ縺・}</div>
    </div>
  );
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}