'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Language, Message, AppStatus, ERRORS } from '../types';
import { useSessionManager } from '../hooks/useSessionManager';
import SessionWarning from './SessionWarning';

interface MainScreenProps {
  language: Language;
  onBack: () => void;
}

export default function MainScreen({ language, onBack }: MainScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<AppStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState<string>(() => `session_${Date.now()}`);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [showScrollToLatest, setShowScrollToLatest] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // PRD隕∽ｻｶ: 30蛻・俣謫堺ｽ懊↑縺冷・閾ｪ蜍慕ｵゆｺ・√え繧ｧ繝ｫ繧ｫ繝逕ｻ髱｢縺ｫ謌ｻ繧・  const sessionManager = useSessionManager({
    timeoutMinutes: 30,
    warningMinutes: 5,
    onTimeout: () => {
      console.log('Session expired - returning to welcome screen');
      onBack();
    },
    onWarning: (remainingMinutes) => {
      console.log(`Session warning: ${remainingMinutes} minutes remaining`);
    }
  });

  // 繧ｻ繝・す繝ｧ繝ｳ髢句ｧ・  useEffect(() => {
    sessionManager.startSession();
  }, []);

  // 繝｡繝・そ繝ｼ繧ｸ霑ｽ蜉譎ゅ↓繧ｻ繝・す繝ｧ繝ｳ豢ｻ蜍輔ｒ險倬鹸
  const handleUserActivity = () => {
    sessionManager.resetTimer();
  };

  // 繧ｹ繧ｯ繝ｭ繝ｼ繝ｫ邂｡逅・  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      setShowScrollToLatest(false);
    }
  };

  // 譁ｰ逹繝｡繝・そ繝ｼ繧ｸ譎ゅ・繧ｹ繧ｯ繝ｭ繝ｼ繝ｫ蛻ｶ蠕｡
  useEffect(() => {
    if (messages.length > 0 && containerRef.current) {
      const container = containerRef.current;
      const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 50;
      
      if (isAtBottom) {
        scrollToBottom();
      } else {
        setShowScrollToLatest(true);
      }
    }
  }, [messages]);

  // 繧ｹ繧ｯ繝ｭ繝ｼ繝ｫ繧､繝吶Φ繝育屮隕・  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 50;
      setShowScrollToLatest(!isAtBottom && messages.length > 0);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages.length]);

  // 繝｡繝・そ繝ｼ繧ｸ霑ｽ蜉・郁ｩｱ閠・・蜍募愛螳夲ｼ・  const addMessage = (originalText: string, translatedText: string, detectedLang: Language) => {
    const isCustomer = detectedLang !== 'ja';
    const speaker = isCustomer ? 'customer' : 'staff';
    
    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random()}`,
      sessionId,
      detectedLanguage: detectedLang,
      originalText,
      translatedText,
      sttLatencyMs: Math.floor(Math.random() * 800) + 400,
      translateLatencyMs: Math.floor(Math.random() * 1200) + 600,
      createdAt: new Date(),
      isComplete: true,
      speaker,
    };

    setMessages(prev => [...prev, newMessage]);
    
    // 鄙ｻ險ｳ螳御ｺ・ヵ繝ｩ繝・す繝･繧｢繝九Γ繝ｼ繧ｷ繝ｧ繝ｳ
    setTimeout(() => {
      const messageElement = document.querySelector(`[data-testid="message-${newMessage.id}"]`);
      if (messageElement) {
        messageElement.classList.add('animate-highlight-flash');
        setTimeout(() => {
          messageElement.classList.remove('animate-highlight-flash');
        }, 300);
      }
    }, 100);
  };

  // Next.js API Routes邨ｱ蜷磯浹螢ｰ隱崎ｭ倥・鄙ｻ險ｳ
  const handleRealTranslation = async () => {
    setStatus('listening');
    handleUserActivity(); // 繧ｻ繝・す繝ｧ繝ｳ豢ｻ蜍輔ｒ險倬鹸
    
    try {
      // 繝｢繝・け髻ｳ螢ｰ繝輔ぃ繧､繝ｫ菴懈・・磯幕逋ｺ逕ｨ・・      const mockBlob = new Blob(['mock audio data'], { type: 'audio/wav' });
      const formData = new FormData();
      formData.append('audio', mockBlob, 'mock.wav');
      
      // STT API蜻ｼ縺ｳ蜃ｺ縺・      const sttResponse = await fetch('/api/v1/stt', {
        method: 'POST',
        body: formData
      });
      
      if (!sttResponse.ok) {
        throw new Error('STT API failed');
      }
      
      const sttResult = await sttResponse.json();
      setStatus('processing');
      
      // 鄙ｻ險ｳAPI蜻ｼ縺ｳ蜃ｺ縺・      const targetLang = sttResult.detectedLanguage === 'ja' ? language : 'ja';
      
      const translateResponse = await fetch('/api/v1/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: sttResult.text,
          sourceLanguage: sttResult.detectedLanguage,
          targetLanguage: targetLang
        })
      });
      
      if (!translateResponse.ok) {
        throw new Error('Translation API failed');
      }
      
      const translateResult = await translateResponse.json();
      
      // 繝｡繝・そ繝ｼ繧ｸ霑ｽ蜉
      addMessage(sttResult.text, translateResult.translatedText, sttResult.detectedLanguage);
      setStatus('idle');
      
    } catch (error) {
      console.error('API Error:', error);
      showError('STT_FAILED');
      setStatus('idle');
    }
  };

  // 繧ｨ繝ｩ繝ｼ陦ｨ遉ｺ・・遘貞ｾ後↓閾ｪ蜍墓ｶ亥悉・・  const showError = (errorCode: string) => {
    const errorInfo = ERRORS[errorCode];
    if (!errorInfo) return;

    setError(errorCode);
    setTimeout(() => {
      setError(null);
    }, 3000);
  };

  // PRD v2.2: 險隱槭Λ繝吶Ν蜑企勁縺ｫ繧医ｊ髢｢謨ｰ繧ょ炎髯､

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg-main)' }}>
      {/* 繧ｹ繝・・繧ｿ繧ｹ繝舌・ */}
      <div 
        data-testid="status-bar"
        className="flex justify-between items-center px-5 py-4 border-b border-gray-200"
        style={{ background: 'var(--bg-main)' }}
      >
        <div className="flex items-center gap-2">
          {status === 'listening' ? (
            <span className="animate-blink text-status" style={{ color: 'var(--status-listening)' }}>
              閥 閨槭＞縺ｦ縺・∪縺・            </span>
          ) : status === 'processing' ? (
            <span className="text-status" style={{ color: 'var(--text-secondary)' }}>
              竢ｳ 鄙ｻ險ｳ荳ｭ...
            </span>
          ) : status === 'offline' ? (
            <span className="text-status" style={{ color: 'var(--status-listening)' }}>
              笶・繧ｪ繝輔Λ繧､繝ｳ
            </span>
          ) : (
            <span className="text-status" style={{ color: 'var(--status-idle)' }}>
              痔 蠕・ｩ滉ｸｭ
            </span>
          )}
        </div>
        
        <button 
          data-testid="btn-settings"
          className="text-lg opacity-60 hover:opacity-100 transition-opacity duration-200 p-2"
        >
          笞呻ｸ・        </button>
      </div>

      {/* 繝｡繧､繝ｳ繧ｳ繝ｳ繝・Φ繝・*/}
      <div className="flex-1 relative">
        {messages.length === 0 ? (
          /* 蛻晄悄繧ｬ繧､繝臥判髱｢ */
          <div className="flex flex-col items-center justify-center h-full text-center p-10">
            <div 
              data-testid="mic-icon"
              className="animate-breathe mb-6"
              style={{ 
                fontSize: 'var(--mic-icon-size)', 
                color: 'var(--accent-primary)'
              }}
            >
              痔
            </div>
            
            {/* 髻ｳ螢ｰ繝ｬ繝吶Ν繝｡繝ｼ繧ｿ繝ｼ */}
            {status === 'listening' && (
              <div data-testid="audio-level-meter" className="flex gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-accent-primary rounded transition-all duration-100"
                    style={{ 
                      height: `${20 + (audioLevel * 30)}px`,
                      background: 'var(--accent-primary)',
                      opacity: Math.random() > 0.3 ? 1 : 0.3
                    }}
                  />
                ))}
              </div>
            )}
            
            <p 
              data-testid="guide-text"
              className="text-guide font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {language === 'en' ? 'Please start speaking' :
               language === 'ko' ? '・川楳﨑ｴ ・ｼ・ｸ・・ :
               language === 'zh' ? '隸ｷ蠑蟋玖ｯｴ隸・ : 'Please start speaking'}
            </p>
            
            {/* 繝ｪ繧｢繝ｫ髻ｳ螢ｰ蜈･蜉帙・繧ｿ繝ｳ */}
            <button
              onClick={handleRealTranslation}
              disabled={status !== 'idle'}
              className="mt-8 px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'var(--accent-primary)',
                color: 'var(--text-white)',
              }}
            >
              {status === 'listening' ? '閥 閨槭＞縺ｦ縺・∪縺・..' : 
               status === 'processing' ? '竢ｳ 鄙ｻ險ｳ荳ｭ...' : 
               '痔 髻ｳ螢ｰ蜈･蜉・}
            </button>
          </div>
        ) : (
          /* 莨夊ｩｱ螻･豁ｴ */
          <div className="h-full flex flex-col">
            <div className="text-xs text-center py-2" style={{ color: 'var(--text-secondary)' }}>
              繧ｹ繧ｯ繝ｭ繝ｼ繝ｫ蜿ｯ閭ｽ 竊・            </div>
            
            <div 
              ref={containerRef}
              data-testid="conversation-container"
              className="flex-1 overflow-y-auto p-5 scroll-smooth"
            >
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  data-testid={`message-${message.id}`}
                  className="relative pl-5 mb-message-gap"
                >
                  {/* 蟾ｦ繝舌・ */}
                  <div
                    data-testid={`message-bar-${message.id}`}
                    className="absolute left-0 top-0 bottom-0 rounded"
                    style={{
                      width: 'var(--bar-width)',
                      background: message.speaker === 'customer' ? 'var(--bar-customer)' : 'var(--bar-staff)'
                    }}
                  />
                  
                  {/* PRD v2.2: 險隱槭Λ繝吶Ν蜑企勁 */}
                  
                  {/* 蜴滓枚 */}
                  <div 
                    data-testid={`original-text-${message.id}`}
                    className="text-original mb-within-message"
                    style={{ 
                      fontSize: 'var(--font-original)',
                      color: 'var(--text-primary)',
                      lineHeight: 'var(--line-height-normal)'
                    }}
                  >
                    {message.originalText}
                  </div>
                  
                  {/* 鄙ｻ險ｳ */}
                  <div 
                    data-testid={`translated-text-${message.id}`}
                    className="text-translated font-medium"
                    style={{ 
                      fontSize: 'var(--font-translated)',
                      color: 'var(--text-translated)',
                      lineHeight: 'var(--line-height-translated)'
                    }}
                  >
                    {message.translatedText}
                  </div>
                </div>
              ))}
            </div>
            
            {/* 繝ｪ繧｢繝ｫ髻ｳ螢ｰ蜈･蜉帙・繧ｿ繝ｳ・井ｼ夊ｩｱ荳ｭ・・*/}
            <div className="p-5 text-center border-t border-gray-200">
              <button
                onClick={handleRealTranslation}
                disabled={status !== 'idle'}
                className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--accent-primary)',
                  color: 'var(--text-white)',
                }}
              >
                {status === 'listening' ? '閥 閨槭＞縺ｦ縺・∪縺・..' : 
                 status === 'processing' ? '竢ｳ 鄙ｻ險ｳ荳ｭ...' : 
                 '痔 髻ｳ螢ｰ蜈･蜉・}
              </button>
            </div>
          </div>
        )}
        
        {/* 譛譁ｰ縺ｸ繝懊ち繝ｳ */}
        {showScrollToLatest && (
          <button
            data-testid="btn-scroll-to-latest"
            onClick={scrollToBottom}
            className="animate-slide-up fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full font-semibold shadow-lg z-50 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
            style={{
              background: 'var(--accent-primary)',
              color: 'var(--text-white)',
            }}
          >
            竊・譛譁ｰ縺ｸ
          </button>
        )}
      </div>

      {/* 繧ｨ繝ｩ繝ｼ繧ｪ繝ｼ繝舌・繝ｬ繧､ */}
      {error && (
        <div 
          data-testid="error-overlay"
          className="animate-fade-out fixed bottom-20 left-1/2 transform -translate-x-1/2 max-w-2xl w-11/12 p-6 rounded-xl text-center z-50"
          style={{
            background: 'var(--bg-error)',
            border: '2px solid var(--border-error)'
          }}
        >
          <div data-testid="error-icon" className="text-5xl mb-4">笞・・/div>
          <div 
            data-testid="error-title-ja"
            className="text-2xl font-semibold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            {ERRORS[error].titleJa}
          </div>
          <div 
            data-testid="error-title-en"
            className="text-2xl font-semibold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            {ERRORS[error].titleEn}
          </div>
          <div 
            data-testid="error-message-ja"
            className="text-xl mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            {ERRORS[error].messageJa}
          </div>
          <div 
            data-testid="error-message-en"
            className="text-xl mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            {ERRORS[error].messageEn}
          </div>
          <div className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            痔 貅門ｙ縺後〒縺阪∪縺励◆ / Ready to listen
          </div>
        </div>
      )}

      {/* 繧ｻ繝・す繝ｧ繝ｳ隴ｦ蜻翫ム繧､繧｢繝ｭ繧ｰ */}
      {sessionManager.showWarning && (
        <SessionWarning
          remainingTime={sessionManager.remainingTime}
          onExtend={sessionManager.extendSession}
          onEndNow={() => onBack()}
          formatTime={sessionManager.formatTime}
        />
      )}
    </div>
  );
}
