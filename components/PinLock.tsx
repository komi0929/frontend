'use client';

import React, { useState, useEffect } from 'react';

interface PinLockProps {
  onSuccess: () => void;
  onBack?: () => void;
  title?: string;
  isFirstTime?: boolean;
}

export default function PinLock({ onSuccess, onBack, title = "設定", isFirstTime = false }: PinLockProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isConfirmMode, setIsConfirmMode] = useState(isFirstTime);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockEndTime, setLockEndTime] = useState<number | null>(null);
  const [error, setError] = useState('');

  // PRD要件: 初回起動時PIN変更強制、連続10回ミス→30分ロック
  const MAX_ATTEMPTS = 10;
  const LOCK_DURATION = 30 * 60 * 1000; // 30分

  useEffect(() => {
    // ロック状態確認
    const savedLockEnd = localStorage.getItem('pinLockEndTime');
    if (savedLockEnd) {
      const lockEnd = parseInt(savedLockEnd);
      if (Date.now() < lockEnd) {
        setIsLocked(true);
        setLockEndTime(lockEnd);
      } else {
        localStorage.removeItem('pinLockEndTime');
        localStorage.removeItem('pinAttempts');
      }
    }

    // 試行回数復元
    const savedAttempts = localStorage.getItem('pinAttempts');
    if (savedAttempts) {
      setAttempts(parseInt(savedAttempts));
    }

    // 初回起動確認
    const hasCustomPin = localStorage.getItem('hasCustomPin');
    if (!hasCustomPin && !isFirstTime) {
      setIsConfirmMode(true);
    }
  }, [isFirstTime]);

  useEffect(() => {
    // ロック時間カウントダウン
    if (isLocked && lockEndTime) {
      const interval = setInterval(() => {
        if (Date.now() >= lockEndTime) {
          setIsLocked(false);
          setLockEndTime(null);
          setAttempts(0);
          localStorage.removeItem('pinLockEndTime');
          localStorage.removeItem('pinAttempts');
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isLocked, lockEndTime]);

  const getStoredPin = (): string => {
    return localStorage.getItem('appPin') || '1234';
  };

  const handlePinInput = (digit: string) => {
    if (isLocked) return;

    if (isConfirmMode) {
      if (pin.length < 4) {
        const newPin = pin + digit;
        setPin(newPin);
        if (newPin.length === 4) {
          // 確認モード: 次はconfirmPin入力
          if (confirmPin === '') {
            setConfirmPin(newPin);
            setPin('');
            setError('PINを再入力してください');
          } else {
            // 確認
            if (newPin === confirmPin) {
              localStorage.setItem('appPin', confirmPin);
              localStorage.setItem('hasCustomPin', 'true');
              setError('');
              onSuccess();
            } else {
              setError('PINが一致しません。最初からやり直してください。');
              setPin('');
              setConfirmPin('');
            }
          }
        }
      }
    } else {
      if (pin.length < 4) {
        const newPin = pin + digit;
        setPin(newPin);
        if (newPin.length === 4) {
          verifyPin(newPin);
        }
      }
    }
  };

  const verifyPin = (inputPin: string) => {
    const storedPin = getStoredPin();
    
    if (inputPin === storedPin) {
      // 成功
      setError('');
      setAttempts(0);
      localStorage.removeItem('pinAttempts');
      onSuccess();
    } else {
      // 失敗
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem('pinAttempts', newAttempts.toString());
      
      if (newAttempts >= MAX_ATTEMPTS) {
        // 30分ロック
        const lockEnd = Date.now() + LOCK_DURATION;
        setIsLocked(true);
        setLockEndTime(lockEnd);
        localStorage.setItem('pinLockEndTime', lockEnd.toString());
        setError('');
      } else {
        setError(`PINが間違っています。残り${MAX_ATTEMPTS - newAttempts}回`);
      }
      
      setPin('');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleClear = () => {
    if (isLocked) return;
    setPin('');
    setError('');
  };

  const handleDelete = () => {
    if (isLocked) return;
    setPin(prev => prev.slice(0, -1));
  };

  const formatLockTime = (): string => {
    if (!lockEndTime) return '';
    const remaining = Math.max(0, lockEndTime - Date.now());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8" style={{ background: 'var(--bg-main)' }}>
        <div className="bg-white rounded-xl p-8 shadow-lg text-center max-w-md w-full">
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            アクセスがロックされました
          </h2>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
            PINの入力に{MAX_ATTEMPTS}回連続で失敗したため、30分間ロックされています。
          </p>
          <div className="text-3xl font-mono mb-6" style={{ color: 'var(--accent-primary)' }}>
            {formatLockTime()}
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-lg font-semibold"
              style={{ background: 'var(--accent-secondary)', color: 'var(--text-primary)' }}
            >
              戻る
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8" style={{ background: 'var(--bg-main)' }}>
      <div className="bg-white rounded-xl p-8 shadow-lg text-center max-w-md w-full">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          {onBack && (
            <button
              onClick={onBack}
              className="text-2xl p-2 rounded-full hover:bg-gray-100"
              style={{ color: 'var(--text-secondary)' }}
            >
              ←
            </button>
          )}
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {isConfirmMode ? (confirmPin ? 'PIN再入力' : 'PIN設定') : `${title}アクセス`}
          </h2>
          <div className="w-10"></div>
        </div>

        {/* 説明テキスト */}
        {isFirstTime && (
          <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
            セキュリティのため、4桁のPINを設定してください。
            デフォルトの1234は使用できません。
          </p>
        )}

        {/* PIN表示 */}
        <div className="flex justify-center gap-4 mb-6">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className="w-12 h-12 border-2 rounded-lg flex items-center justify-center text-2xl"
              style={{ 
                borderColor: pin.length > index ? 'var(--accent-primary)' : '#E5E7EB',
                backgroundColor: pin.length > index ? 'var(--accent-primary)' : 'transparent'
              }}
            >
              {pin.length > index ? (
                <span style={{ color: 'var(--text-white)' }}>●</span>
              ) : null}
            </div>
          ))}
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-6 p-3 rounded-lg" style={{ background: 'var(--bg-error)', color: 'var(--text-primary)' }}>
            {error}
          </div>
        )}

        {/* 試行回数表示 */}
        {attempts > 0 && !isConfirmMode && (
          <div className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            失敗回数: {attempts}/{MAX_ATTEMPTS}
          </div>
        )}

        {/* 数字キーパッド */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handlePinInput(num.toString())}
              className="w-16 h-16 rounded-lg text-2xl font-semibold transition-colors duration-200 hover:scale-105"
              style={{ 
                background: 'var(--bg-main)', 
                color: 'var(--text-primary)',
                border: '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              {num}
            </button>
          ))}
        </div>

        {/* 0とアクションボタン */}
        <div className="flex justify-center gap-3">
          <button
            onClick={handleClear}
            className="w-16 h-16 rounded-lg text-lg font-semibold transition-colors duration-200"
            style={{ background: 'var(--accent-secondary)', color: 'var(--text-primary)' }}
          >
            C
          </button>
          <button
            onClick={() => handlePinInput('0')}
            className="w-16 h-16 rounded-lg text-2xl font-semibold transition-colors duration-200"
            style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-16 h-16 rounded-lg text-lg font-semibold transition-colors duration-200"
            style={{ background: 'var(--accent-secondary)', color: 'var(--text-primary)' }}
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}