"use client";
import React, { useState } from "react";
import PinLock from "@/components/security/PinLock";

export default function Display() {
  const [showPin, setShowPin] = useState(false);

  return (
    <main className="welcome-container">
      <button
        className="settings-button"
        data-testid="btn-settings"
        aria-label="settings"
        onClick={() => setShowPin(true)}
      >
        設定
      </button>

      {showPin && (
        <PinLock>
          <div className="sr-only">PIN OK</div>
        </PinLock>
      )}
    </main>
  );
}