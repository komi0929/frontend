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
      <h1 className='text-3xl font-bold text-green-600 mb-4'>決済が完了しました</h1>
      <p className='text-gray-700 mb-2'>ご利用ありがとうございます。マイク到着後14日間は無料です。</p>
      {saved && <p className='text-gray-600 mb-4'>お客様番号を保存しました。ポータルから請求情報を確認できます。</p>}
      {err && <p className='text-red-600 mb-4'>{err}</p>}
      <Link href='/' className='underline text-blue-600'>ホームへ戻る</Link>
    </main>
  );
}