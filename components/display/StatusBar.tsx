"use client";
import React from "react";

export default function StatusBar({ listening }: { listening: boolean }){
  return (
    <div className="statusbar" data-testid="status-bar" role="status" aria-live="polite">
      <span className={`status-dot ${listening ? "listening" : "idle"}`} aria-hidden="true" />
      <span className="status-text">{listening ? "リスニング中..." : "待機中"}</span>
    </div>
  );
}