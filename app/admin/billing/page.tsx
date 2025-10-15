"use client";
import React, { useState } from "react";

export default function BillingPortal() {
  const [customerId, setCustomerId] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function openPortal() {
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/v1/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customerId || undefined,
          email: email || undefined,
          returnUrl: "/admin/subscription",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.url) throw new Error(json?.error || "failed");
      location.href = json.url;
    } catch (e:any) {
      setErr(e?.message || "failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Billing / Customer Portal</h1>
      <div className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Customer ID（任意）</label>
          <input className="border rounded px-3 py-2 w-full" value={customerId} onChange={e=>setCustomerId(e.target.value)} placeholder="cus_..." />
        </div>
        <div>
          <label className="block text-sm mb-1">Email（Customer IDがなければ）</label>
          <input className="border rounded px-3 py-2 w-full" value={email} onChange={e=>setEmail(e.target.value)} placeholder="user@example.com" />
        </div>
        <button onClick={openPortal} disabled={busy} className="px-4 py-2 rounded text-white" style={{background:"#6B9080"}}>Portalを開く</button>
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <p className="text-xs text-gray-500 mt-4">※ どちらも未指定の場合は、環境変数 STRIPE_TEST_CUSTOMER_ID が使われます。</p>
      </div>
    </main>
  );
}