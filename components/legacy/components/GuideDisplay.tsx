"use client";

interface GuideDisplayProps {
  guideText: string;
}

export default function GuideDisplay({ guideText }: GuideDisplayProps) {
  return (
    <div className="guide-container">
      {/* 繝槭う繧ｯ繧｢繧､繧ｳ繝ｳ・亥他蜷ｸ繧｢繝九Γ繝ｼ繧ｷ繝ｧ繝ｳ・・*/}
      <div className="mic-icon" data-testid="mic-icon">
        痔
      </div>

      {/* 髻ｳ螢ｰ繝ｬ繝吶Ν繝｡繝ｼ繧ｿ繝ｼ・磯撕逧・｡ｨ遉ｺ・・*/}
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

      {/* 繧ｬ繧､繝峨ユ繧ｭ繧ｹ繝・*/}
      <p className="guide-text" data-testid="guide-text">
        {guideText}
      </p>
    </div>
  );
}
