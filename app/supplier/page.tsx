"use client";
import { useEffect, useState } from "react";

export default function SupplierDashboard(){
  const [stats,setStats]=useState<any>({});
  useEffect(()=>{ (async()=>{ const r=await fetch("/api/v1/dashboard/stats"); setStats(await r.json()); })(); },[]);
  const langs = stats.langs || {};
  return (
    <main className='min-h-screen p-6'>
      <h1 className='text-2xl font-bold mb-4'>運営ダッシュボード</h1>
      <div className='grid sm:grid-cols-3 gap-4 mb-6'>
        <div className='bg-white shadow-soft p-4 rounded-2xl'><h3 className='font-semibold mb-1'>登録店舗</h3><p className='text-2xl'>{stats.users??0}</p></div>
        <div className='bg-white shadow-soft p-4 rounded-2xl'><h3 className='font-semibold mb-1'>稼働中</h3><p className='text-2xl'>{stats.active??0}</p></div>
        <div className='bg-white shadow-soft p-4 rounded-2xl'><h3 className='font-semibold mb-1'>対応言語</h3><p className='text-2xl'>{Object.keys(langs).length}</p></div>
      </div>
      <h2 className='text-xl font-semibold mb-2'>言語別利用数</h2>
      <ul className='list-disc pl-6 text-sm'>
        {Object.entries(langs).map(([k,v]:any)=> <li key={k}>{String(k).toUpperCase()}: {String(v)}</li>)}
      </ul>
    </main>
  );
}