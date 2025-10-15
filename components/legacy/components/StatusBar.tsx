"use client";

import { AppStatus } from "../types";

interface StatusBarProps {
  status: AppStatus;
  audioLevel?: number;
  onSettingsClick: () => void;
}

// 繧ｹ繝・・繧ｿ繧ｹ繝・く繧ｹ繝・const STATUS_TEXTS: Record<AppStatus, string> = {
  idle: "痔 蠕・ｩ滉ｸｭ",
  listening: "閥 閨槭＞縺ｦ縺・∪縺・,
  processing: "竢ｳ 鄙ｻ險ｳ荳ｭ...",
  error: "笶・繧ｨ繝ｩ繝ｼ",
  offline: "笶・繧ｪ繝輔Λ繧､繝ｳ",
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

      {/* 髻ｳ螢ｰ繝ｬ繝吶Ν繝｡繝ｼ繧ｿ繝ｼ・・istening譎ゅ・縺ｿ陦ｨ遉ｺ・・*/}
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

      {/* 險ｭ螳壹・繧ｿ繝ｳ */}
      <button
        className="settings-button"
        data-testid="btn-settings"
        onClick={onSettingsClick}
      >
        笞呻ｸ・      </button>
    </div>
  );
}
