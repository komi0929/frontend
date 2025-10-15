"use client";
import React, { useEffect, useState } from "react";

type Props = { children?: React.ReactNode };

export default function PinLock({ children }: Props) {
  const defaultPin = (process.env.NEXT_PUBLIC_ADMIN_PIN || "4242").toString();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  function submit() {
    if (pin === defaultPin) {
      setError("");
      (document.getElementById("pin-dialog") as HTMLDialogElement | null)?.close?.();
      alert("PIN が正しく認証されました。");
    } else {
      setError("PIN が違います。");
    }
  }

  useEffect(() => { setError(""); }, [pin]);

  return (
    <dialog id="pin-dialog" open className="rounded-lg border p-6 max-w-sm w-full">
      <h2 className="text-lg font-bold mb-3">管理者 PIN</h2>
      <input
        autoFocus
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        className="border rounded px-3 py-2 w-full mb-2"
        placeholder="4桁のPIN"
        value={pin}
        onChange={(e) => setPin((e.target as HTMLInputElement).value)}
        onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
      />
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button className="px-3 py-2 border rounded" onClick={() => setPin("")}>クリア</button>
        <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={submit}>解除</button>
      </div>
      {children}
    </dialog>
  );
}