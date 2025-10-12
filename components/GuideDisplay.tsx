"use client";

interface GuideDisplayProps {
  guideText: string;
}

export default function GuideDisplay({ guideText }: GuideDisplayProps) {
  return (
    <div className="guide-container">
      {/* マイクアイコン（呼吸アニメーション） */}
      <div className="mic-icon" data-testid="mic-icon">
        🎤
      </div>

      {/* 音声レベルメーター（静的表示） */}
      <div className="audio-meter">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="audio-meter-bar"
            style={{
              height: `${i * 2}px`,
            }}
          />
        ))}
      </div>

      {/* ガイドテキスト */}
      <p className="guide-text" data-testid="guide-text">
        {guideText}
      </p>
    </div>
  );
}