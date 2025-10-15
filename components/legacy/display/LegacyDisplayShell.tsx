"use client";
import * as React from "react";

export function LegacyDisplayShell({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-6">
      <div className="text-3xl font-bold text-gray-800 mb-4">あんしんディスプレイ</div>
      <div className="w-full max-w-3xl">{children}</div>
    </div>
  );
}
