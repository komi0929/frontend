"use client";
import React, { useState, useEffect } from "react";

type Shipment = {
  id: string;
  carrier: string;
  trackingNumber: string;
  shippedAt: string;
  expectedArrivalDate: string;
  deliveredAt?: string;
  status?: string;
  buyoutAt?: string;
  condition?: string;
  sanitizedAt?: string;
  incident?: string;
};

export default function ShipmentsPage() {
  const [list, setList] = useState<Shipment[]>([]);

  useEffect(() => {
    // 初期読み込み
    const raw = localStorage.getItem("shipments");
    if (raw) setList(JSON.parse(raw));
  }, []);

  const saveLocal = () => {
    localStorage.setItem("shipments", JSON.stringify(list));
    alert("ローカルに保存しました。");
  };

  const loadLocal = () => {
    const raw = localStorage.getItem("shipments");
    if (raw) {
      setList(JSON.parse(raw));
      alert("ローカルデータを読み込みました。");
    }
  };

  const clearLocal = () => {
    localStorage.removeItem("shipments");
    alert("ローカルデータを削除しました。");
  };

  function splitCSV(line: string): string[] {
    return line.split(",").map((v) => v.trim());
  }

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">出荷管理</h1>

      <div className="flex gap-3 mb-6">
        <button
          onClick={saveLocal}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          保存
        </button>
        <button
          onClick={loadLocal}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          読み込み
        </button>
        <button
          onClick={clearLocal}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          削除
        </button>
      </div>

      <table className="w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">ID</th>
            <th className="p-2 border">配送業者</th>
            <th className="p-2 border">追跡番号</th>
            <th className="p-2 border">出荷日</th>
            <th className="p-2 border">到着予定</th>
            <th className="p-2 border">状態</th>
          </tr>
        </thead>
        <tbody>
          {list.map((s) => (
            <tr key={s.id}>
              <td className="p-2 border">{s.id}</td>
              <td className="p-2 border">{s.carrier}</td>
              <td className="p-2 border">{s.trackingNumber}</td>
              <td className="p-2 border">{s.shippedAt}</td>
              <td className="p-2 border">{s.expectedArrivalDate}</td>
              <td className="p-2 border">{s.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}