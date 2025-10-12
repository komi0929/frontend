"use client";

import { AppStatus } from "../types";

interface StatusBarProps {
  status: AppStatus;
  audioLevel?: number;
  onSettingsClick: () => void;
}

// ステータステキスト
const STATUS_TEXTS: Record<AppStatus, string> = {
  idle: "🎤 待機中",
  listening: "🔴 聞いています",
  processing: "⏳ 翻訳中...",
  error: "❌ エラー",
  offline: "❌ オフライン",
};

export default function StatusBar({ status, audioLevel = 0, onSettingsClick }: StatusBarProps) {
  return (
    <div className="status-bar">
      <div 
        className={`status-text ${status === 'listening' ? 'listening' : ''}`}
        data-testid="status-bar"
      >
        {STATUS_TEXTS[status]}
      </div>

      {/* 音声レベルメーター（listening時のみ表示） */}
      {status === 'listening' && (
        <div className="audio-meter" data-testid="audio-level-meter">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="audio-meter-bar"
              style={{
                height: `${Math.min((audioLevel / 100) * i * 4, 20)}px`,
              }}
            />
          ))}
        </div>
      )}

      {/* 設定ボタン */}
      <button
        className="settings-button"
        data-testid="btn-settings"
        onClick={onSettingsClick}
      >
        ⚙️
      </button>
    </div>
  );
}