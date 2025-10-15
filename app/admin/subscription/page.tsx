"use client";
import React, { useState } from "react";

/**
 * サブスクリプション（7日トライアル）
 * - 「7日間無料で試す」: /api/v1/stripe/checkout に POST (mode: "checkout")
 * - 「顧客ポータルを開く」: /api/v1/stripe/checkout に POST (mode: "portal")
 * ※ どちらもレスポンスJSONに { url } が返る前提（PRDどおり）
 */
export default function SubscriptionPage() {
  const [loading, setLoading] = useState<null | "checkout" | "portal">(null);
  const [err, setErr] = useState("");

  async function startCheckout() {
    setLoading("checkout");
    setErr("");
    try {
      const res = await fetch("/api/v1/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "checkout" }),
      });
      const data = await res.json();
      if (res.ok && data?.url) {
        window.location.href = data.url;
        return;
      }
      setErr(
        data?.error ||
          "Checkout セッションの作成に失敗しました。Stripeの価格ID/キー設定をご確認ください。"
      );
    } catch (e: any) {
      setErr(e?.message || "Checkout セッションの作成に失敗しました。");
    } finally {
      setLoading(null);
    }
  }

  async function openPortal() {
    setLoading("portal");
    setErr("");
    try {
      const res = await fetch("/api/v1/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "portal" }),
      });
      const data = await res.json();
      if (res.ok && data?.url) {
        window.location.href = data.url;
        return;
      }
      setErr(data?.error || "顧客ポータルURLの取得に失敗しました。");
    } catch (e: any) {
      setErr(e?.message || "顧客ポータルURLの取得に失敗しました。");
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">サブスクリプション</h1>
      <p className="text-gray-600 mb-6">
        7日間の無料トライアル後に月額課金が開始されます。トライアル中にいつでもキャンセルできます。
      </p>

      <div className="space-y-4">
        <button
          onClick={startCheckout}
          disabled={!!loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading === "checkout" ? "作成中..." : "7日間無料で試す"}
        </button>

        <button
          onClick={openPortal}
          disabled={!!loading}
          className="border px-6 py-3 rounded-lg disabled:opacity-50"
        >
          {loading === "portal" ? "読み込み中..." : "顧客ポータルを開く"}
        </button>

        {err && <p className="text-red-600">{err}</p>}
      </div>

      <div className="mt-8 text-sm text-gray-500">
        <ul className="list-disc pl-5 space-y-1">
          <li>トライアル期間中のキャンセルには料金は発生しません。</li>
          <li>トライアル終了後は自動的に有料プランへ移行します。</li>
          <li>請求先・支払い方法の変更は顧客ポータルから可能です。</li>
        </ul>
      </div>
    </main>
  );
}