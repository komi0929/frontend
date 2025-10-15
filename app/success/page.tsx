"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Success() {
  const [saved,setSaved] = useState(false);
  const [err,setErr] = useState("");

  useEffect(()=>{
    const sp = new URLSearchParams(location.search);
    const id = sp.get("session_id");
    (async()=>{
      try{
        if(!id) return;
        const r = await fetch(`/api/v1/stripe/session?id=${encodeURIComponent(id)}`);
        const j = await r.json();
        if(j?.customer){
          localStorage.setItem("stripe_customer_id", j.customer);
          setSaved(true);
        }
      }catch(e:any){ setErr(e?.message||"session_error");}
    })();
  },[]);

  return (
    <main className='min-h-screen flex flex-col items-center justify-center p-8 text-center'>
      <h1 className='text-3xl font-bold text-green-600 mb-4'>豎ｺ貂医′螳御ｺ・＠縺ｾ縺励◆</h1>
      <p className='text-gray-700 mb-2'>縺泌茜逕ｨ縺ゅｊ縺後→縺・＃縺悶＞縺ｾ縺吶ゅ・繧､繧ｯ蛻ｰ逹蠕・4譌･髢薙・辟｡譁吶〒縺吶・/p>
      {saved && <p className='text-gray-600 mb-4'>縺雁ｮ｢讒倡分蜿ｷ繧剃ｿ晏ｭ倥＠縺ｾ縺励◆縲ゅ・繝ｼ繧ｿ繝ｫ縺九ｉ隲区ｱよュ蝣ｱ繧堤｢ｺ隱阪〒縺阪∪縺吶・/p>}
      {err && <p className='text-red-600 mb-4'>{err}</p>}
      <Link href='/' className='underline text-blue-600'>繝帙・繝縺ｸ謌ｻ繧・/Link>
    </main>
  );
}