"use client";
import { useState } from "react";

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [perr, setPerr] = useState("");

  async function startTrial() {
    setLoading(true); setErr("");
    try {
      const res = await fetch("/api/v1/stripe/checkout", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ need_mic: true, policy_mic_return_ack: true, trial_period_days: 7 })
      });
      const data = await res.json();
      if (data?.url) window.location.href = data.url;
      else setErr(data?.error || "Checkout セッションの作成に失敗しました。");
    } catch(e:any) { setErr(e?.message || "Checkoutエラー"); }
    setLoading(false);
  }

  async function openPortal(){
    setPerr("");
    try{
      const cid = localStorage.getItem("stripe_customer_id");
      if(!cid){ setPerr("お客様番号が見つかりません。決済完了後に再度お試しください。"); return; }
      const r = await fetch("/api/v1/stripe/portal",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ customerId: cid })});
      const j = await r.json();
      if(j?.url) location.href = j.url;
      else setPerr(j?.error || "ポータルを開けませんでした。");
    }catch(e:any){ setPerr(e?.message || "portal_error");}
  }

  return (
    <main className='min-h-screen p-6 flex flex-col items-center justify-center bg-white text-center'>
      <h1 className='text-2xl font-bold mb-4'>サブスクリプション管理</h1>
      <p className='text-gray-600 mb-6'>マイク到着後14日間は完全無料、以降は月額990円。</p>
      <div className='flex flex-col gap-3'>
        <button onClick={startTrial} disabled={loading} className='px-6 py-3 rounded-2xl bg-[#F59E0B] text-white disabled:opacity-50'>
          {loading ? "処理中..." : "7日間(仮)無料で開始 → 到着後14日に自動補正"}
        </button>
        <button onClick={openPortal} className='px-6 py-3 rounded-2xl border'>
          請求情報（Customer Portal）を開く
        </button>
      </div>
      {err && <div className='text-red-600 mt-4'>{err}</div>}
      {perr && <div className='text-red-600 mt-2'>{perr}</div>}
    </main>
  );
}