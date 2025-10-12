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

  // PRD要件: 30分間操作なし→自動終了、ウェルカム画面に戻る
  const sessionManager = useSessionManager({
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

  // セッション開始
  useEffect(() => {
    sessionManager.startSession();
  }, []);

  // メッセージ追加時にセッション活動を記録
  const handleUserActivity = () => {
    sessionManager.resetTimer();
  };

  // スクロール管理
  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      setShowScrollToLatest(false);
    }
  };

  // 新着メッセージ時のスクロール制御
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

  // スクロールイベント監視
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 50;
      setShowScrollToLatest(!isAtBottom && messages.length > 0);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages.length]);

  // メッセージ追加（話者自動判定）
  const addMessage = (originalText: string, translatedText: string, detectedLang: Language) => {
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
    
    // 翻訳完了フラッシュアニメーション
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

  // Next.js API Routes統合音声認識・翻訳
  const handleRealTranslation = async () => {
    setStatus('listening');
    handleUserActivity(); // セッション活動を記録
    
    try {
      // モック音声ファイル作成（開発用）
      const mockBlob = new Blob(['mock audio data'], { type: 'audio/wav' });
      const formData = new FormData();
      formData.append('audio', mockBlob, 'mock.wav');
      
      // STT API呼び出し
      const sttResponse = await fetch('/api/v1/stt', {
        method: 'POST',
        body: formData
      });
      
      if (!sttResponse.ok) {
        throw new Error('STT API failed');
      }
      
      const sttResult = await sttResponse.json();
      setStatus('processing');
      
      // 翻訳API呼び出し
      const targetLang = sttResult.detectedLanguage === 'ja' ? language : 'ja';
      
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
      
      // メッセージ追加
      addMessage(sttResult.text, translateResult.translatedText, sttResult.detectedLanguage);
      setStatus('idle');
      
    } catch (error) {
      console.error('API Error:', error);
      showError('STT_FAILED');
      setStatus('idle');
    }
  };

  // エラー表示（3秒後に自動消去）
  const showError = (errorCode: string) => {
    const errorInfo = ERRORS[errorCode];
    if (!errorInfo) return;

    setError(errorCode);
    setTimeout(() => {
      setError(null);
    }, 3000);
  };

  // PRD v2.2: 言語ラベル削除により関数も削除

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg-main)' }}>
      {/* ステータスバー */}
      <div 
        data-testid="status-bar"
        className="flex justify-between items-center px-5 py-4 border-b border-gray-200"
        style={{ background: 'var(--bg-main)' }}
      >
        <div className="flex items-center gap-2">
          {status === 'listening' ? (
            <span className="animate-blink text-status" style={{ color: 'var(--status-listening)' }}>
              🔴 聞いています
            </span>
          ) : status === 'processing' ? (
            <span className="text-status" style={{ color: 'var(--text-secondary)' }}>
              ⏳ 翻訳中...
            </span>
          ) : status === 'offline' ? (
            <span className="text-status" style={{ color: 'var(--status-listening)' }}>
              ❌ オフライン
            </span>
          ) : (
            <span className="text-status" style={{ color: 'var(--status-idle)' }}>
              🎤 待機中
            </span>
          )}
        </div>
        
        <button 
          data-testid="btn-settings"
          className="text-lg opacity-60 hover:opacity-100 transition-opacity duration-200 p-2"
        >
          ⚙️
        </button>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 relative">
        {messages.length === 0 ? (
          /* 初期ガイド画面 */
          <div className="flex flex-col items-center justify-center h-full text-center p-10">
            <div 
              data-testid="mic-icon"
              className="animate-breathe mb-6"
              style={{ 
                fontSize: 'var(--mic-icon-size)', 
                color: 'var(--accent-primary)'
              }}
            >
              🎤
            </div>
            
            {/* 音声レベルメーター */}
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
               language === 'ko' ? '말씀해 주세요' :
               language === 'zh' ? '请开始说话' : 'Please start speaking'}
            </p>
            
            {/* リアル音声入力ボタン */}
            <button
              onClick={handleRealTranslation}
              disabled={status !== 'idle'}
              className="mt-8 px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'var(--accent-primary)',
                color: 'var(--text-white)',
              }}
            >
              {status === 'listening' ? '🔴 聞いています...' : 
               status === 'processing' ? '⏳ 翻訳中...' : 
               '🎤 音声入力'}
            </button>
          </div>
        ) : (
          /* 会話履歴 */
          <div className="h-full flex flex-col">
            <div className="text-xs text-center py-2" style={{ color: 'var(--text-secondary)' }}>
              スクロール可能 ↑
            </div>
            
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
                  {/* 左バー */}
                  <div
                    data-testid={`message-bar-${message.id}`}
                    className="absolute left-0 top-0 bottom-0 rounded"
                    style={{
                      width: 'var(--bar-width)',
                      background: message.speaker === 'customer' ? 'var(--bar-customer)' : 'var(--bar-staff)'
                    }}
                  />
                  
                  {/* PRD v2.2: 言語ラベル削除 */}
                  
                  {/* 原文 */}
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
                  
                  {/* 翻訳 */}
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
            
            {/* リアル音声入力ボタン（会話中） */}
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
                {status === 'listening' ? '🔴 聞いています...' : 
                 status === 'processing' ? '⏳ 翻訳中...' : 
                 '🎤 音声入力'}
              </button>
            </div>
          </div>
        )}
        
        {/* 最新へボタン */}
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
            ↓ 最新へ
          </button>
        )}
      </div>

      {/* エラーオーバーレイ */}
      {error && (
        <div 
          data-testid="error-overlay"
          className="animate-fade-out fixed bottom-20 left-1/2 transform -translate-x-1/2 max-w-2xl w-11/12 p-6 rounded-xl text-center z-50"
          style={{
            background: 'var(--bg-error)',
            border: '2px solid var(--border-error)'
          }}
        >
          <div data-testid="error-icon" className="text-5xl mb-4">⚠️</div>
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
            🎤 準備ができました / Ready to listen
          </div>
        </div>
      )}

      {/* セッション警告ダイアログ */}
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