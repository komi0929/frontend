"use client";
import { useEffect, useRef, useState } from "react";

type Shipment = {
  id: string;
  subscriptionId?: string;
  carrier: string;
  trackingNumber: string;
  shippedAt?: string;
  expectedArrivalDate?: string;
  deliveredAt?: string;
  status: "draft" | "shipped" | "delivered" | "returned" | "lost";
  buyoutAt?: string;
  condition?: string;
  sanitizedAt?: string;
  incident?: string;
};

const FIELDS = ["subscriptionId","carrier","trackingNumber","shippedAt","expectedArrivalDate","deliveredAt","status","buyoutAt","condition","sanitizedAt","incident"] as const;

export default function ShipmentsPage() {
  const [list, setList] = useState<Shipment[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("shipments");
      if (raw) setList(JSON.parse(raw));
    } catch {}
  }, []);

  const add = () =>
    setList((prev) => [
      ...prev,
      { id: crypto.randomUUID?.() ?? "id-"+Date.now(), carrier: "", trackingNumber: "", status: "draft" },
    ]);

  const saveLocal = () => { localStorage.setItem("shipments", JSON.stringify(list)); alert("繝ｭ繝ｼ繧ｫ繝ｫ縺ｫ菫晏ｭ倥＠縺ｾ縺励◆縲・); };
  const loadLocal = () => { const raw = localStorage.getItem("shipments"); if (raw) setList(JSON.parse(raw)); };
  const clearLocal = () => { localStorage.removeItem("shipments"); alert("繝ｭ繝ｼ繧ｫ繝ｫ菫晏ｭ倥ｒ繧ｯ繝ｪ繧｢縺励∪縺励◆縲・); };

  function splitCSV(line: string): string[] {
    const res: string[] = []; let cur=""; let q=false;
    for (let i=0;i<line.length;i++){
      const ch=line[i];
      if (ch === '"'){ if(q && line[i+1]==='"'){ cur+='"'; i++; } else { q=!q; } }
      else if (ch === "," && !q){ res.push(cur); cur=""; }
      else cur+=ch;
    }
    res.push(cur);
    return res.map(s=>s.trim());
  }
  function parseCSV(csv: string): any[] {
    const rows = csv.replace(/\r/g,"").split("\n").filter(Boolean);
    if (!rows.length) return [];
    const headers = splitCSV(rows[0]);
    return rows.slice(1).map(r=>{
      const cols = splitCSV(r); const o:any = {};
      headers.forEach((h,idx)=> o[h] = cols[idx] ?? "");
      return o;
    });
  }
  function toCSV(rows: any[]): string {
    const esc = (v:any)=> {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
    };
    const head = FIELDS.join(",");
    const body = rows.map(r => FIELDS.map(h=>esc((r as any)[h]||"")).join(",")).join("\n");
    return head + "\n" + body;
  }

  const onImportCSV = async (f: File) => {
    const text = await f.text();
    const rows = parseCSV(text);
    const mapped: Shipment[] = rows.map((r:any)=>({
      id: crypto.randomUUID?.() ?? "id-"+Math.random().toString(36).slice(2),
      carrier: r.carrier || "",
      trackingNumber: r.trackingNumber || "",
      status: (r.status as any) || "draft",
      subscriptionId: r.subscriptionId || "",
      shippedAt: r.shippedAt || "",
      expectedArrivalDate: r.expectedArrivalDate || "",
      deliveredAt: r.deliveredAt || "",
      buyoutAt: r.buyoutAt || "",
      condition: r.condition || "",
      sanitizedAt: r.sanitizedAt || "",
      incident: r.incident || ""
    }));
    setList(mapped);
  };

  const onExportCSV = () => {
    const csv = toCSV(list);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "shipments.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  async function updateTrial(s: Shipment){
    try {
      const res = await fetch("/api/v1/shipment/update", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(s)
      });
      const text = await res.text();
      alert(text);
    } catch (e:any) { alert(e?.message || "update_failed"); }
  }

  async function buyout(s: Shipment){
    if (!s.subscriptionId) { alert("subscriptionId 繧貞・蜉帙＠縺ｦ縺上□縺輔＞縲・); return; }
    if (!confirm("譛ｪ霑泌唆縺ｨ縺励※ ﾂ･1,000・域里螳夲ｼ峨ｒ隲区ｱゅ＠縺ｾ縺吶ゅｈ繧阪＠縺・〒縺吶°・・)) return;
    try {
      const r = await fetch("/api/v1/shipment/buyout",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ subscriptionId: s.subscriptionId, reason:"device buyout (unreturned)" })
      });
      const j = await r.json();
      if (j?.ok) alert("雋ｷ蜿冶ｫ区ｱゅｒ螳溯｡後＠縺ｾ縺励◆・郁ｫ区ｱよ嶌: "+j.invoice+"・峨・);
      else alert(j?.error || "buyout_failed");
    } catch(e:any){ alert(e?.message || "buyout_failed"); }
  }

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">逋ｺ騾√・霑泌唆邂｡逅・/h1>

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={add} className="px-3 py-2 bg-black text-white rounded">陦後ｒ霑ｽ蜉</button>
        <button onClick={()=>fileRef.current?.click()} className="px-3 py-2 border rounded">CSV繧定ｪｭ縺ｿ霎ｼ繧</button>
        <input type="file" ref={fileRef} accept=".csv,text/csv" className="hidden"
          onChange={(e)=>{ const f=e.target.files?.[0]; if(f) onImportCSV(f); e.currentTarget.value=""; }} />
        <button onClick={onExportCSV} className="px-3 py-2 border rounded">CSV縺ｫ譖ｸ縺榊・縺・/button>
        <button onClick={saveLocal} className="px-3 py-2 border rounded">繝ｭ繝ｼ繧ｫ繝ｫ菫晏ｭ・/button>
        <button onClick={loadLocal} className="px-3 py-2 border rounded">繝ｭ繝ｼ繧ｫ繝ｫ隱ｭ霎ｼ</button>
        <button onClick={clearLocal} className="px-3 py-2 border rounded">繧ｯ繝ｪ繧｢</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border text-sm bg-white">
          <thead className="bg-gray-100">
            <tr>
              {FIELDS.map((f)=>(<th key={f} className="border p-2">{f}</th>))}
              <th className="border p-2">trial_end譖ｴ譁ｰ</th>
              <th className="border p-2">譛ｪ霑泌唆竊定ｲｷ蜿・/th>
            </tr>
          </thead>
          <tbody>
            {list.map((s,i)=>(
              <tr key={s.id} className="border-b">
                {FIELDS.map((k)=>(
                  <td key={k} className="border p-1">
                    <input className="w-full border px-1 py-1"
                      defaultValue={(s as any)[k]||""}
                      onChange={(e)=>{ const v=e.target.value; setList(prev=>prev.map((x,ix)=>ix===i?{...x,[k]:v}:x)); }} />
                  </td>
                ))}
                <td className="border p-1">
                  <button onClick={()=>updateTrial(list[i])} className="px-2 py-1 bg-[#F59E0B] text-white rounded">
                    Stripe縺ｸ蜿肴丐
                  </button>
                </td>
                <td className="border p-1">
                  <button onClick={()=>buyout(list[i])} className="px-2 py-1 bg-red-600 text-white rounded">
                    雋ｷ蜿冶ｫ区ｱ・                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-gray-500 text-sm">
        蛻ｰ逹莠亥ｮ壽律/螳溷芦逹縺ｧ <code>trial_end</code> 繧呈峩譁ｰ縺励∪縺吶よ悴霑泌唆縺ｯ縲瑚ｲｷ蜿冶ｫ区ｱゅ阪〒ﾂ･1,000・域里螳夲ｼ峨ｒ隱ｲ驥代＠縺ｾ縺吶・      </p>
    </main>
  );
}