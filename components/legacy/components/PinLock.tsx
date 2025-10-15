'use client';

import React, { useState, useEffect } from 'react';

interface PinLockProps {
  onSuccess: () => void;
  onBack?: () => void;
  title?: string;
  isFirstTime?: boolean;
}

export default function PinLock({ onSuccess, onBack, title = "險ｭ螳・, isFirstTime = false }: PinLockProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isConfirmMode, setIsConfirmMode] = useState(isFirstTime);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockEndTime, setLockEndTime] = useState<number | null>(null);
  const [error, setError] = useState('');

  // PRD隕∽ｻｶ: 蛻晏屓襍ｷ蜍墓凾PIN螟画峩蠑ｷ蛻ｶ縲・｣邯・0蝗槭Α繧ｹ竊・0蛻・Ο繝・け
  const MAX_ATTEMPTS = 10;
  const LOCK_DURATION = 30 * 60 * 1000; // 30蛻・
  useEffect(() => {
    // 繝ｭ繝・け迥ｶ諷狗｢ｺ隱・    const savedLockEnd = localStorage.getItem('pinLockEndTime');
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

    // 隧ｦ陦悟屓謨ｰ蠕ｩ蜈・    const savedAttempts = localStorage.getItem('pinAttempts');
    if (savedAttempts) {
      setAttempts(parseInt(savedAttempts));
    }

    // 蛻晏屓襍ｷ蜍慕｢ｺ隱・    const hasCustomPin = localStorage.getItem('hasCustomPin');
    if (!hasCustomPin && !isFirstTime) {
      setIsConfirmMode(true);
    }
  }, [isFirstTime]);

  useEffect(() => {
    // 繝ｭ繝・け譎る俣繧ｫ繧ｦ繝ｳ繝医ム繧ｦ繝ｳ
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
          // 遒ｺ隱阪Δ繝ｼ繝・ 谺｡縺ｯconfirmPin蜈･蜉・          if (confirmPin === '') {
            setConfirmPin(newPin);
            setPin('');
            setError('PIN繧貞・蜈･蜉帙＠縺ｦ縺上□縺輔＞');
          } else {
            // 遒ｺ隱・            if (newPin === confirmPin) {
              localStorage.setItem('appPin', confirmPin);
              localStorage.setItem('hasCustomPin', 'true');
              setError('');
              onSuccess();
            } else {
              setError('PIN縺御ｸ閾ｴ縺励∪縺帙ｓ縲よ怙蛻昴°繧峨ｄ繧顔峩縺励※縺上□縺輔＞縲・);
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
      // 謌仙粥
      setError('');
      setAttempts(0);
      localStorage.removeItem('pinAttempts');
      onSuccess();
    } else {
      // 螟ｱ謨・      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem('pinAttempts', newAttempts.toString());
      
      if (newAttempts >= MAX_ATTEMPTS) {
        // 30蛻・Ο繝・け
        const lockEnd = Date.now() + LOCK_DURATION;
        setIsLocked(true);
        setLockEndTime(lockEnd);
        localStorage.setItem('pinLockEndTime', lockEnd.toString());
        setError('');
      } else {
        setError(`PIN縺碁俣驕輔▲縺ｦ縺・∪縺吶よｮ九ｊ${MAX_ATTEMPTS - newAttempts}蝗杼);
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
          <div className="text-6xl mb-6">白</div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            繧｢繧ｯ繧ｻ繧ｹ縺後Ο繝・け縺輔ｌ縺ｾ縺励◆
          </h2>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
            PIN縺ｮ蜈･蜉帙↓{MAX_ATTEMPTS}蝗樣｣邯壹〒螟ｱ謨励＠縺溘◆繧√・0蛻・俣繝ｭ繝・け縺輔ｌ縺ｦ縺・∪縺吶・          </p>
          <div className="text-3xl font-mono mb-6" style={{ color: 'var(--accent-primary)' }}>
            {formatLockTime()}
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-lg font-semibold"
              style={{ background: 'var(--accent-secondary)', color: 'var(--text-primary)' }}
            >
              謌ｻ繧・            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8" style={{ background: 'var(--bg-main)' }}>
      <div className="bg-white rounded-xl p-8 shadow-lg text-center max-w-md w-full">
        {/* 繝倥ャ繝繝ｼ */}
        <div className="flex justify-between items-center mb-6">
          {onBack && (
            <button
              onClick={onBack}
              className="text-2xl p-2 rounded-full hover:bg-gray-100"
              style={{ color: 'var(--text-secondary)' }}
            >
              竊・            </button>
          )}
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {isConfirmMode ? (confirmPin ? 'PIN蜀榊・蜉・ : 'PIN險ｭ螳・) : `${title}繧｢繧ｯ繧ｻ繧ｹ`}
          </h2>
          <div className="w-10"></div>
        </div>

        {/* 隱ｬ譏弱ユ繧ｭ繧ｹ繝・*/}
        {isFirstTime && (
          <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
            繧ｻ繧ｭ繝･繝ｪ繝・ぅ縺ｮ縺溘ａ縲・譯√・PIN繧定ｨｭ螳壹＠縺ｦ縺上□縺輔＞縲・            繝・ヵ繧ｩ繝ｫ繝医・1234縺ｯ菴ｿ逕ｨ縺ｧ縺阪∪縺帙ｓ縲・          </p>
        )}

        {/* PIN陦ｨ遉ｺ */}
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
                <span style={{ color: 'var(--text-white)' }}>笳・/span>
              ) : null}
            </div>
          ))}
        </div>

        {/* 繧ｨ繝ｩ繝ｼ繝｡繝・そ繝ｼ繧ｸ */}
        {error && (
          <div className="mb-6 p-3 rounded-lg" style={{ background: 'var(--bg-error)', color: 'var(--text-primary)' }}>
            {error}
          </div>
        )}

        {/* 隧ｦ陦悟屓謨ｰ陦ｨ遉ｺ */}
        {attempts > 0 && !isConfirmMode && (
          <div className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            螟ｱ謨怜屓謨ｰ: {attempts}/{MAX_ATTEMPTS}
          </div>
        )}

        {/* 謨ｰ蟄励く繝ｼ繝代ャ繝・*/}
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

        {/* 0縺ｨ繧｢繧ｯ繧ｷ繝ｧ繝ｳ繝懊ち繝ｳ */}
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
            竚ｫ
          </button>
        </div>
      </div>
    </div>
  );
}
