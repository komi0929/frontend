'use client';

import React from 'react';

interface SessionWarningProps {
  remainingTime: number;
  onExtend: () => void;
  onEndNow: () => void;
  formatTime: (seconds: number) => string;
}

export default function SessionWarning({ 
  remainingTime, 
  onExtend, 
  onEndNow,
  formatTime 
}: SessionWarningProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 shadow-xl text-center max-w-md mx-4">
        <div className="text-6xl mb-4">竢ｰ</div>
        
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          繧ｻ繝・す繝ｧ繝ｳ邨ゆｺ・ｺ亥相
        </h2>
        
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          謫堺ｽ懊′縺励・繧峨￥讀懷・縺輔ｌ縺ｦ縺・∪縺帙ｓ縲・br/>
          繧ｻ繝・す繝ｧ繝ｳ縺ｯ谿九ｊ<span className="font-bold text-xl" style={{ color: 'var(--accent-primary)' }}>
            {formatTime(remainingTime)}
          </span>縺ｧ閾ｪ蜍慕ｵゆｺ・＠縺ｾ縺吶・        </p>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={onExtend}
            className="px-6 py-3 rounded-lg font-semibold transition-colors duration-200 hover:scale-105"
            style={{
              background: 'var(--accent-primary)',
              color: 'var(--text-white)'
            }}
          >
            繧ｻ繝・す繝ｧ繝ｳ繧貞ｻｶ髟ｷ
          </button>
          
          <button
            onClick={onEndNow}
            className="px-6 py-3 rounded-lg font-semibold transition-colors duration-200 hover:scale-105"
            style={{
              background: 'var(--accent-secondary)',
              color: 'var(--text-primary)'
            }}
          >
            邨ゆｺ・☆繧・          </button>
        </div>
      </div>
    </div>
  );
}
