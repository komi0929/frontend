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

  const saveLocal = () => { localStorage.setItem("shipments", JSON.stringify(list)); alert("ローカルに保存しました。"); };
  const loadLocal = () => { const raw = localStorage.getItem("shipments"); if (raw) setList(JSON.parse(raw)); };
  const clearLocal = () => { localStorage.removeItem("shipments"); alert("ローカル保存をクリアしました。"); };

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
    if (!s.subscriptionId) { alert("subscriptionId を入力してください。"); return; }
    if (!confirm("未返却として ¥1,000（既定）を請求します。よろしいですか？")) return;
    try {
      const r = await fetch("/api/v1/shipment/buyout",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ subscriptionId: s.subscriptionId, reason:"device buyout (unreturned)" })
      });
      const j = await r.json();
      if (j?.ok) alert("買取請求を実行しました（請求書: "+j.invoice+"）。");
      else alert(j?.error || "buyout_failed");
    } catch(e:any){ alert(e?.message || "buyout_failed"); }
  }

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">発送・返却管理</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={add} className="px-3 py-2 bg-black text-white rounded">行を追加</button>
        <button onClick={()=>fileRef.current?.click()} className="px-3 py-2 border rounded">CSVを読み込む</button>
        <input type="file" ref={fileRef} accept=".csv,text/csv" className="hidden"
          onChange={(e)=>{ const f=e.target.files?.[0]; if(f) onImportCSV(f); e.currentTarget.value=""; }} />
        <button onClick={onExportCSV} className="px-3 py-2 border rounded">CSVに書き出す</button>
        <button onClick={saveLocal} className="px-3 py-2 border rounded">ローカル保存</button>
        <button onClick={loadLocal} className="px-3 py-2 border rounded">ローカル読込</button>
        <button onClick={clearLocal} className="px-3 py-2 border rounded">クリア</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border text-sm bg-white">
          <thead className="bg-gray-100">
            <tr>
              {FIELDS.map((f)=>(<th key={f} className="border p-2">{f}</th>))}
              <th className="border p-2">trial_end更新</th>
              <th className="border p-2">未返却→買取</th>
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
                    Stripeへ反映
                  </button>
                </td>
                <td className="border p-1">
                  <button onClick={()=>buyout(list[i])} className="px-2 py-1 bg-red-600 text-white rounded">
                    買取請求
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-gray-500 text-sm">
        到着予定日/実到着で <code>trial_end</code> を更新します。未返却は「買取請求」で¥1,000（既定）を課金します。
      </p>
    </main>
  );
}