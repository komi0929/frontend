"use client";

import { useEffect } from "react";
import { Language, ERRORS } from "../types";

interface ErrorOverlayProps {
  error: string;
  selectedLanguage: Language;
  onDismiss: () => void;
}

export default function ErrorOverlay({ error, selectedLanguage, onDismiss }: ErrorOverlayProps) {
  const errorData = ERRORS[error] || ERRORS.STT_FAILED;

  // 3秒後に自動消去（persistentフラグがない場合）
  useEffect(() => {
    if (!errorData.persistent) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [errorData.persistent, onDismiss]);

  return (
    <div className="error-overlay" data-testid="error-overlay">
      <div className="error-icon" data-testid="error-icon">
        ⚠️
      </div>
      
      <div className="error-title" data-testid="error-title-ja">
        {errorData.titleJa}
      </div>
      <div className="error-title" data-testid="error-title-en">
        {errorData.titleEn}
      </div>

      <div className="error-message" data-testid="error-message-ja">
        {errorData.messageJa}
      </div>
      <div className="error-message" data-testid="error-message-en">
        {errorData.messageEn}
      </div>

      {!errorData.persistent && (
        <div className="error-ready">
          🎤 準備ができました<br />
          Ready to listen
        </div>
      )}
    </div>
  );
}