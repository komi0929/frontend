"use client";
import React, { useState } from "react";

export default function PinLock({ children }: { children?: React.ReactNode }) {
  const [pin, setPin] = useState("");
  const correctPin = process.env.NEXT_PUBLIC_ADMIN_PIN || "4242";

  const submit = () => {
    if (pin === correctPin) {
      alert("PIN 認証に成功しました。");
    } else {
      alert("PIN が違います。");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-center mb-4">管理者用PIN</h2>
        <input
          autoFocus
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          className="border p-2 rounded w-full mb-4"
          placeholder="4桁のPIN"
          value={pin}
          onChange={(e) => setPin((e.target as HTMLInputElement).value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <div className="flex justify-between">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={submit}
          >
            解除
          </button>
          <button
            className="border px-4 py-2 rounded"
            onClick={() => setPin("")}
          >
            クリア
          </button>
        </div>
        <p className="text-sm text-gray-500 text-center mt-3">
          既定PINは4242／環境変数 NEXT_PUBLIC_ADMIN_PIN で変更可能
        </p>
      </div>
      {children}
    </div>
  );
}