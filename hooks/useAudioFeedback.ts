import { useCallback, useRef, useState } from 'react';

interface AudioFeedbackOptions {
  enabled?: boolean;
  volume?: number; // 0-1, PRD要件: 30% = 0.3
}

interface SoundEffects {
  translationComplete: string;
  speechDetected: string;
  error: string;
  sessionWarning: string;
}

export function useAudioFeedback({ 
  enabled = true, 
  volume = 0.3 
}: AudioFeedbackOptions = {}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());

  // Web Audio API初期化
  const initializeAudio = useCallback(async () => {
    if (!enabled) return;

    try {
      // AudioContextの作成（ユーザージェスチャー後に実行）
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // 効果音の生成（実際のファイルがない場合は合成音で代用）
      await generateSoundEffects();
      setIsLoaded(true);
      setError(null);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Audio initialization failed';
      setError(errorMessage);
      console.error('Audio feedback initialization error:', err);
    }
  }, [enabled]);

  // 効果音生成（合成音）
  const generateSoundEffects = useCallback(async () => {
    if (!audioContextRef.current) return;

    const context = audioContextRef.current;
    const sampleRate = context.sampleRate;
    
    // 翻訳完了音（上昇チャイム）
    const translationCompleteBuffer = context.createBuffer(1, sampleRate * 0.3, sampleRate);
    const translationData = translationCompleteBuffer.getChannelData(0);
    
    for (let i = 0; i < translationData.length; i++) {
      const t = i / sampleRate;
      const frequency1 = 800 + (400 * t); // 800Hz → 1200Hz
      const frequency2 = 1200 + (300 * t); // 1200Hz → 1500Hz
      
      const wave1 = Math.sin(2 * Math.PI * frequency1 * t);
      const wave2 = Math.sin(2 * Math.PI * frequency2 * t);
      const envelope = Math.exp(-t * 3); // フェードアウト
      
      translationData[i] = (wave1 + wave2) * 0.5 * envelope * 0.3;
    }

    // 音声検出音（短いビープ）
    const speechDetectedBuffer = context.createBuffer(1, sampleRate * 0.1, sampleRate);
    const speechData = speechDetectedBuffer.getChannelData(0);
    
    for (let i = 0; i < speechData.length; i++) {
      const t = i / sampleRate;
      const wave = Math.sin(2 * Math.PI * 1000 * t); // 1000Hz
      const envelope = Math.exp(-t * 10);
      speechData[i] = wave * envelope * 0.2;
    }

    // エラー音（下降トーン）
    const errorBuffer = context.createBuffer(1, sampleRate * 0.5, sampleRate);
    const errorData = errorBuffer.getChannelData(0);
    
    for (let i = 0; i < errorData.length; i++) {
      const t = i / sampleRate;
      const frequency = 600 - (300 * t); // 600Hz → 300Hz
      const wave = Math.sin(2 * Math.PI * frequency * t);
      const envelope = Math.exp(-t * 2);
      errorData[i] = wave * envelope * 0.4;
    }

    // セッション警告音（繰り返しビープ）
    const warningBuffer = context.createBuffer(1, sampleRate * 1.0, sampleRate);
    const warningData = warningBuffer.getChannelData(0);
    
    for (let i = 0; i < warningData.length; i++) {
      const t = i / sampleRate;
      const beepInterval = 0.25; // 250msごと
      const beepPhase = (t % beepInterval) / beepInterval;
      
      if (beepPhase < 0.5) { // 50%オンタイム
        const wave = Math.sin(2 * Math.PI * 800 * t);
        const envelope = Math.sin(Math.PI * beepPhase * 2); // ベル型エンベロープ
        warningData[i] = wave * envelope * 0.3;
      } else {
        warningData[i] = 0; // 無音
      }
    }

    // バッファーを保存
    audioBuffersRef.current.set('translationComplete', translationCompleteBuffer);
    audioBuffersRef.current.set('speechDetected', speechDetectedBuffer);
    audioBuffersRef.current.set('error', errorBuffer);
    audioBuffersRef.current.set('sessionWarning', warningBuffer);

  }, []);

  // 効果音再生
  const playSound = useCallback((soundName: keyof SoundEffects) => {
    if (!enabled || !isLoaded || !audioContextRef.current) {
      return;
    }

    const audioBuffer = audioBuffersRef.current.get(soundName);
    if (!audioBuffer) {
      console.warn(`Sound "${soundName}" not found`);
      return;
    }

    try {
      const source = audioContextRef.current.createBufferSource();
      const gainNode = audioContextRef.current.createGain();
      
      source.buffer = audioBuffer;
      gainNode.gain.value = volume;
      
      source.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      source.start();
      
      console.log(`Audio feedback: ${soundName} played`);
      
    } catch (err) {
      console.error(`Failed to play sound "${soundName}":`, err);
    }
  }, [enabled, isLoaded, volume]);

  // PRD要件: 翻訳完了時の効果音（0.3秒、音量30%）
  const playTranslationComplete = useCallback(() => {
    playSound('translationComplete');
  }, [playSound]);

  // 音声検出時の効果音
  const playSpeechDetected = useCallback(() => {
    playSound('speechDetected');
  }, [playSound]);

  // エラー時の効果音
  const playError = useCallback(() => {
    playSound('error');
  }, [playSound]);

  // セッション警告時の効果音
  const playSessionWarning = useCallback(() => {
    playSound('sessionWarning');
  }, [playSound]);

  // 音量調整
  const setVolume = useCallback((newVolume: number) => {
    // 次回再生時に適用
    // volume stateは親コンポーネントで管理
  }, []);

  // AudioContext再開（ユーザージェスチャー後）
  const resumeAudioContext = useCallback(async () => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
      console.log('AudioContext resumed');
    }
  }, []);

  // クリーンアップ
  const cleanup = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    audioBuffersRef.current.clear();
    setIsLoaded(false);
  }, []);

  return {
    isLoaded,
    error,
    initializeAudio,
    resumeAudioContext,
    playTranslationComplete,
    playSpeechDetected,
    playError,
    playSessionWarning,
    setVolume,
    cleanup
  };
}