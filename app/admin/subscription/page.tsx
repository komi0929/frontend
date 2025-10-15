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
      else setErr(data?.error || "Checkout 繧ｻ繝・す繝ｧ繝ｳ縺ｮ菴懈・縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲・);
    } catch(e:any) { setErr(e?.message || "Checkout繧ｨ繝ｩ繝ｼ"); }
    setLoading(false);
  }

  async function openPortal(){
    setPerr("");
    try{
      const cid = localStorage.getItem("stripe_customer_id");
      if(!cid){ setPerr("縺雁ｮ｢讒倡分蜿ｷ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ縲よｱｺ貂亥ｮ御ｺ・ｾ後↓蜀榊ｺｦ縺願ｩｦ縺励￥縺縺輔＞縲・); return; }
      const r = await fetch("/api/v1/stripe/portal",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ customerId: cid })});
      const j = await r.json();
      if(j?.url) location.href = j.url;
      else setPerr(j?.error || "繝昴・繧ｿ繝ｫ繧帝幕縺代∪縺帙ｓ縺ｧ縺励◆縲・);
    }catch(e:any){ setPerr(e?.message || "portal_error");}
  }

  return (
    <main className='min-h-screen p-6 flex flex-col items-center justify-center bg-white text-center'>
      <h1 className='text-2xl font-bold mb-4'>繧ｵ繝悶せ繧ｯ繝ｪ繝励す繝ｧ繝ｳ邂｡逅・/h1>
      <p className='text-gray-600 mb-6'>繝槭う繧ｯ蛻ｰ逹蠕・4譌･髢薙・螳悟・辟｡譁吶∽ｻ･髯阪・譛磯｡・90蜀・・/p>
      <div className='flex flex-col gap-3'>
        <button onClick={startTrial} disabled={loading} className='px-6 py-3 rounded-2xl bg-[#F59E0B] text-white disabled:opacity-50'>
          {loading ? "蜃ｦ逅・ｸｭ..." : "7譌･髢・莉ｮ)辟｡譁吶〒髢句ｧ・竊・蛻ｰ逹蠕・4譌･縺ｫ閾ｪ蜍戊｣懈ｭ｣"}
        </button>
        <button onClick={openPortal} className='px-6 py-3 rounded-2xl border'>
          隲区ｱよュ蝣ｱ・・ustomer Portal・峨ｒ髢九￥
        </button>
      </div>
      {err && <div className='text-red-600 mt-4'>{err}</div>}
      {perr && <div className='text-red-600 mt-2'>{perr}</div>}
    </main>
  );
}