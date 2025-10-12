'use client';

import React from 'react';
import { Language } from '../types';

interface WelcomeScreenProps {
  onLanguageSelect: (language: Language) => void;
}

export default function WelcomeScreen({ onLanguageSelect }: WelcomeScreenProps) {
  const languages = [
    {
      code: 'en' as Language,
      name: 'English',
      message: 'If you have any questions,\nI\'m here to help.',
      tapHint: '👉 Tap here'
    },
    {
      code: 'ko' as Language,
      name: '한국어',
      message: '질문이 있으시면\n도와드리겠습니다.',
      tapHint: '👉 선택'
    },
    {
      code: 'zh' as Language,
      name: '中文',
      message: '如有任何问题，\n我会为您提供帮助。',
      tapHint: '👉 点击'
    }
  ];

  const handleLanguageSelect = (language: Language) => {
    // 0.3秒のアニメーション後に遷移
    setTimeout(() => {
      onLanguageSelect(language);
    }, 300);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-10 relative"
         style={{ 
           background: 'linear-gradient(135deg, #F5F1E8 0%, #E8E4DA 100%)'
         }}>
      
      {/* 設定ボタン */}
      <button 
        data-testid="btn-settings"
        className="absolute top-5 right-5 text-2xl bg-transparent border-none cursor-pointer p-2 opacity-50 hover:opacity-100 transition-opacity duration-300"
      >
        ⚙️
      </button>
      
      {/* メインタイトル（言語選択プロンプト） */}
      <h1 
        data-testid="welcome-language-prompt"
        className="text-2xl font-bold text-center mb-12"
        style={{ color: 'var(--text-primary)' }}
      >
        Please select your language
      </h1>
      
      {/* 横並び3カード */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl w-full mx-auto mb-10 px-8">
        {languages.map((lang, index) => {
          const cardStyles: Record<Language, string> = {
            en: 'bg-gradient-to-br from-card-english-start to-card-english-end hover:from-card-english-end hover:to-[#368888] hover:shadow-[0_12px_32px_rgba(94,184,184,0.4)]',
            ko: 'bg-gradient-to-br from-card-korean-start to-card-korean-end hover:from-card-korean-end hover:to-[#B55A48] hover:shadow-[0_12px_32px_rgba(217,138,122,0.4)]',
            zh: 'bg-gradient-to-br from-card-chinese-start to-card-chinese-end hover:from-card-chinese-end hover:to-[#AC5989] hover:shadow-[0_12px_32px_rgba(208,133,173,0.4)]',
            ja: '' // 使用しないが型として必要
          };

          return (
            <div
              key={lang.code}
              data-testid={`lang-${lang.code}`}
              onClick={() => handleLanguageSelect(lang.code)}
              className={`
                ${cardStyles[lang.code]}
                rounded-[20px] p-8 text-center cursor-pointer
                transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                shadow-[0_8px_24px_rgba(0,0,0,0.12)] min-h-[260px]
                flex flex-col justify-between relative overflow-hidden
                opacity-0 translate-y-[30px] animate-[fadeInUp_0.6s_ease-out_forwards]
                hover:-translate-y-2 active:scale-98 focus:outline focus:outline-3 focus:outline-white/50 focus:outline-offset-4
                lg:min-h-[260px] md:min-h-[180px] sm:min-h-[160px]
              `}
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <h2 className="text-3xl font-bold text-white mb-5 lg:text-3xl md:text-3xl sm:text-2xl">
                {lang.name}
              </h2>
              
              <p 
                className="text-white/95 leading-relaxed mb-5 flex-1 flex items-center justify-center lg:text-xl md:text-lg sm:text-base"
                dangerouslySetInnerHTML={{ __html: lang.message.replace(/\n/g, '<br/>') }}
              />
              
              <span className="text-base text-white/80 font-semibold">
                {lang.tapHint}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* フッターロゴ */}
      <div 
        data-testid="welcome-logo-footer"
        className="text-xs text-center mt-8"
        style={{ color: 'var(--text-footer)' }}
      >
        <span className="font-normal">Powered by </span>あんしんディスプレイ
      </div>
    </div>
  );
}