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
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("このブラウザは録音に対応していません。");
      // すでに録音中なら無視
      if (recording) return;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Safari等配慮: mimeType を可能なら設定
      let mime = "audio/webm";
      const can = (window as any).MediaRecorder?.isTypeSupported;
      if (typeof can === "function") {
        if (!can(mime)) mime = "audio/webm;codecs=opus";
        if (!can(mime)) mime = ""; // ブラウザ任せ
      }

      const rec = mime ? new MediaRecorder(stream, { mimeType: mime as any }) : new MediaRecorder(stream);
      recRef.current = rec;
      chunksRef.current = [];
      startTsRef.current = Date.now();

      rec.ondataavailable = (e) => { if (e?.data?.size) chunksRef.current.push(e.data); };
      rec.onstop = async () => {
        try {
          const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
          const durMs = Math.max(0, Date.now() - startTsRef.current);
          const tooShort = durMs < 350;                 // 0.35秒未満は短すぎ
          const tooSmall = blob.size < 2048;            // 2KB未満は短すぎとみなす

          if (tooShort || tooSmall) {
            onError?.("音声が短すぎます。もう少し長押しして話してください。");
            return; // STTは呼ばない
          }

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
            onError?.("音声を認識できませんでした。もう一度お試しください。");
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

      // 開始時の軽いハプティック
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

    // 終了時のハプティック強化（短いパターン）
    (navigator as any).vibrate?.([0, 20, 40, 20]);
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
    // 押したまま外へ出たら終了扱い（誤操作対策）
    if (pressed || recording) end();
    setPressed(false);
  }

  const active = pressed || recording;

  return (
    <div data-testid="mic-icon" className="mic-wrap" aria-live="polite">
      {/* 録音中の赤いブラーリング（息づかい） */}
      <div className={`mic-ambient ${active ? "on" : ""}`} aria-hidden="true">
        <span className="mic-breath" />
      </div>

      <button
        type="button"
        data-testid="mic-button"
        aria-label={recording ? "録音中" : "長押しで話す"}
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
      <div className="mic-help">{recording ? "話してください..." : "長押しで話す"}</div>
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