"use client";
import React, { useEffect, useState } from "react";

export default function CookieBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const a = typeof window !== "undefined" && localStorage.getItem("cookie_ok");
    if (!a) setShow(true);
  }, []);
  if (!show) return null;
  return (
    <div className="fixed bottom-3 left-0 right-0 mx-auto max-w-3xl bg-white border rounded shadow p-4 flex items-center gap-4">
      <p className="text-sm text-gray-700">本サイトでは利用体験向上のためにクッキーを使用します。</p>
      <button
        onClick={() => { localStorage.setItem("cookie_ok","1"); setShow(false); }}
        className="ml-auto px-3 py-2 bg-blue-600 text-white rounded"
      >同意する</button>
    </div>
  );
}