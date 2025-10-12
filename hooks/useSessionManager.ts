import { useState, useEffect, useRef, useCallback } from 'react';

interface SessionManagerOptions {
  timeoutMinutes?: number;
  onTimeout?: () => void;
  onWarning?: (remainingMinutes: number) => void;
  warningMinutes?: number;
}

interface SessionState {
  isActive: boolean;
  remainingTime: number;
  showWarning: boolean;
}

export function useSessionManager({
  timeoutMinutes = 30,
  onTimeout,
  onWarning,
  warningMinutes = 5
}: SessionManagerOptions = {}) {
  const [sessionState, setSessionState] = useState<SessionState>({
    isActive: false,
    remainingTime: timeoutMinutes * 60,
    showWarning: false
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Reset warning state
    setSessionState(prev => ({
      ...prev,
      remainingTime: timeoutMinutes * 60,
      showWarning: false
    }));

    // Set warning timer (timeout - warning minutes)
    const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000;
    if (warningTime > 0) {
      warningTimeoutRef.current = setTimeout(() => {
        setSessionState(prev => ({ ...prev, showWarning: true }));
        if (onWarning) {
          onWarning(warningMinutes);
        }
      }, warningTime);
    }

    // Set timeout timer
    timeoutRef.current = setTimeout(() => {
      setSessionState(prev => ({ ...prev, isActive: false, showWarning: false }));
      if (onTimeout) {
        onTimeout();
      }
    }, timeoutMinutes * 60 * 1000);

  }, [timeoutMinutes, warningMinutes, onTimeout, onWarning]);

  const extendSession = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  const startSession = useCallback(() => {
    setSessionState(prev => ({
      ...prev,
      isActive: true,
      remainingTime: timeoutMinutes * 60,
      showWarning: false
    }));
    resetTimer();
  }, [resetTimer, timeoutMinutes]);

  const endSession = useCallback(() => {
    setSessionState({
      isActive: false,
      remainingTime: timeoutMinutes * 60,
      showWarning: false
    });
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [timeoutMinutes]);

  // Activity detection
  const handleActivity = useCallback(() => {
    if (sessionState.isActive) {
      resetTimer();
    }
  }, [sessionState.isActive, resetTimer]);

  // Setup activity listeners and countdown timer
  useEffect(() => {
    if (sessionState.isActive) {
      // Activity event listeners
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      
      events.forEach(event => {
        document.addEventListener(event, handleActivity, { passive: true });
      });

      // Countdown timer
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - lastActivityRef.current) / 1000);
        const remaining = Math.max(0, (timeoutMinutes * 60) - elapsed);
        
        setSessionState(prev => ({
          ...prev,
          remainingTime: remaining
        }));
      }, 1000);

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, handleActivity);
        });
        
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [sessionState.isActive, handleActivity, timeoutMinutes]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endSession();
    };
  }, [endSession]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return {
    ...sessionState,
    startSession,
    endSession,
    extendSession,
    resetTimer: handleActivity,
    formatTime: (seconds?: number) => formatTime(seconds ?? sessionState.remainingTime)
  };
}