"use client";
import React, { useEffect, useRef } from "react";

type Message = {
  id: string;
  text: string;
  sender: "user" | "system";
};

export default function MessageList({
  messages,
  isUserScrolling,
}: {
  messages: Message[];
  isUserScrolling: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef<number>(0);

  useEffect(() => {
    // メッセージが新しく追加された時のみスクロールを調整
    if (
      !isUserScrolling &&
      messages.length > prevMessageCountRef.current &&
      containerRef.current
    ) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, isUserScrolling]);

  // スクロール位置の監視
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 20;
    if (atBottom) {
      // ユーザーが最下部までスクロールした時の挙動
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="overflow-y-auto p-4 border rounded-lg bg-white h-[400px]"
    >
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`mb-2 p-2 rounded-lg ${
            msg.sender === "user"
              ? "bg-green-100 text-right"
              : "bg-gray-100 text-left"
          }`}
        >
          {msg.text}
        </div>
      ))}
    </div>
  );
}