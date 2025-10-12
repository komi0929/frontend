"use client";

import { useEffect, useRef, useState } from "react";
import { Message, Language } from "../types";

interface MessageListProps {
  messages: Message[];
  selectedLanguage: Language;
}

export default function MessageList({ messages, selectedLanguage }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const prevMessageCountRef = useRef(0);

  // 自動スクロール（ユーザーが手動スクロール中でない場合のみ）
  useEffect(() => {
    if (!isUserScrolling && containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, isUserScrolling]);

  // スクロール位置の監視
  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    // 新着メッセージがあり、最下部にいない場合のみボタン表示
    const hasNewMessages = messages.length > prevMessageCountRef.current;
    const shouldShowButton = !isAtBottom && hasNewMessages;

    setShowScrollButton(shouldShowButton);
    setIsUserScrolling(!isAtBottom);
  };

  // 最新へスクロール
  const scrollToLatest = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
      setIsUserScrolling(false);
      setShowScrollButton(false);
    }
  };

  return (
    <>
      <div
        ref={containerRef}
        className="conversation-container"
        onScroll={handleScroll}
        data-testid="conversation-container"
      >
        <div className="scroll-hint" data-testid="scroll-hint">
          スクロール可能 ↑
        </div>

        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.isComplete ? 'complete' : ''} ${
              message.detectedLanguage === 'ja' ? 'staff' : 'customer'
            }`}
            data-testid={`message-${message.id}`}
          >
            {/* 左バー（話者区別） */}
            <div
              className={`message-bar ${
                message.detectedLanguage === 'ja' ? 'staff' : 'customer'
              }`}
              data-testid={`message-bar-${message.id}`}
            />

            {/* 原文 */}
            <div
              className="original-text"
              data-testid={`original-text-${message.id}`}
            >
              {message.originalText}
            </div>

            {/* 翻訳 */}
            {message.isComplete ? (
              <div
                className="translated-text"
                data-testid={`translated-text-${message.id}`}
              >
                {message.translatedText}
              </div>
            ) : (
              <div
                className="translation-spinner"
                data-testid={`translation-spinner-${message.id}`}
              >
                <span className="spinner-icon">🔄</span>
                翻訳中...
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 「最新へ」ボタン */}
      {showScrollButton && (
        <button
          className="scroll-to-latest"
          onClick={scrollToLatest}
          data-testid="btn-scroll-to-latest"
        >
          ↓ 最新へ
        </button>
      )}
    </>
  );
}