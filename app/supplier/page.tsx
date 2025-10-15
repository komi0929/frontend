"use client";
import { useEffect, useState } from "react";

export default function SupplierDashboard(){
  const [stats,setStats]=useState<any>({});
  useEffect(()=>{ (async()=>{ const r=await fetch("/api/v1/dashboard/stats"); setStats(await r.json()); })(); },[]);
  const langs = stats.langs || {};
  return (
    <main className='min-h-screen p-6'>
      <h1 className='text-2xl font-bold mb-4'>驕句霧繝繝・す繝･繝懊・繝・/h1>
      <div className='grid sm:grid-cols-3 gap-4 mb-6'>
        <div className='bg-white shadow-soft p-4 rounded-2xl'><h3 className='font-semibold mb-1'>逋ｻ骭ｲ蠎苓・</h3><p className='text-2xl'>{stats.users??0}</p></div>
        <div className='bg-white shadow-soft p-4 rounded-2xl'><h3 className='font-semibold mb-1'>遞ｼ蜒堺ｸｭ</h3><p className='text-2xl'>{stats.active??0}</p></div>
        <div className='bg-white shadow-soft p-4 rounded-2xl'><h3 className='font-semibold mb-1'>蟇ｾ蠢懆ｨ隱・/h3><p className='text-2xl'>{Object.keys(langs).length}</p></div>
      </div>
      <h2 className='text-xl font-semibold mb-2'>險隱槫挨蛻ｩ逕ｨ謨ｰ</h2>
      <ul className='list-disc pl-6 text-sm'>
        {Object.entries(langs).map(([k,v]:any)=> <li key={k}>{String(k).toUpperCase()}: {String(v)}</li>)}
      </ul>
    </main>
  );
}