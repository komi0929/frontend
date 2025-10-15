"use client";
import React, { useState } from "react";

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const openPortal = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "portal" }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage("ポータルURLの取得に失敗しました。");
      }
    } catch (err) {
      console.error(err);
      setMessage("エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Billing / Customer Portal</h1>

      <div className="space-y-4">
        <p>
          サブスクリプションの確認、支払い方法の変更、キャンセルは下記のボタンから行えます。
        </p>

        <button
          onClick={openPortal}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "読み込み中..." : "顧客ポータルを開く"}
        </button>

        {message && <p className="text-red-500 mt-2">{message}</p>}
      </div>
    </main>
  );
}