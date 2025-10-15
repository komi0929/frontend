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

  // 閾ｪ蜍輔せ繧ｯ繝ｭ繝ｼ繝ｫ・医Θ繝ｼ繧ｶ繝ｼ縺梧焔蜍輔せ繧ｯ繝ｭ繝ｼ繝ｫ荳ｭ縺ｧ縺ｪ縺・ｴ蜷医・縺ｿ・・  useEffect(() => {
    if (!isUserScrolling && containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, isUserScrolling]);

  // 繧ｹ繧ｯ繝ｭ繝ｼ繝ｫ菴咲ｽｮ縺ｮ逶｣隕・  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    // 譁ｰ逹繝｡繝・そ繝ｼ繧ｸ縺後≠繧翫∵怙荳矩Κ縺ｫ縺・↑縺・ｴ蜷医・縺ｿ繝懊ち繝ｳ陦ｨ遉ｺ
    const hasNewMessages = messages.length > prevMessageCountRef.current;
    const shouldShowButton = !isAtBottom && hasNewMessages;

    setShowScrollButton(shouldShowButton);
    setIsUserScrolling(!isAtBottom);
  };

  // 譛譁ｰ縺ｸ繧ｹ繧ｯ繝ｭ繝ｼ繝ｫ
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
          繧ｹ繧ｯ繝ｭ繝ｼ繝ｫ蜿ｯ閭ｽ 竊・        </div>

        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.isComplete ? 'complete' : ''} ${
              message.detectedLanguage === 'ja' ? 'staff' : 'customer'
            }`}
            data-testid={`message-${message.id}`}
          >
            {/* 蟾ｦ繝舌・・郁ｩｱ閠・玄蛻･・・*/}
            <div
              className={`message-bar ${
                message.detectedLanguage === 'ja' ? 'staff' : 'customer'
              }`}
              data-testid={`message-bar-${message.id}`}
            />

            {/* 蜴滓枚 */}
            <div
              className="original-text"
              data-testid={`original-text-${message.id}`}
            >
              {message.originalText}
            </div>

            {/* 鄙ｻ險ｳ */}
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
                <span className="spinner-icon">売</span>
                鄙ｻ險ｳ荳ｭ...
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 縲梧怙譁ｰ縺ｸ縲阪・繧ｿ繝ｳ */}
      {showScrollButton && (
        <button
          className="scroll-to-latest"
          onClick={scrollToLatest}
          data-testid="btn-scroll-to-latest"
        >
          竊・譛譁ｰ縺ｸ
        </button>
      )}
    </>
  );
}
