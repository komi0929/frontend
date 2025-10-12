import { useState, useEffect, useRef, useCallback } from 'react';

interface VADOptions {
  onSpeechStart?: () => void;
  onSpeechEnd?: (audioBlob: Blob) => void;
  onVolumeChange?: (volume: number) => void;
  silenceThreshold?: number; // ms
  volumeThreshold?: number; // 0-100
  enabled?: boolean;
}

interface VADState {
  isListening: boolean;
  isRecording: boolean;
  volume: number;
  error: string | null;
}

export function useVAD({
  onSpeechStart,
  onSpeechEnd,
  onVolumeChange,
  silenceThreshold = 800, // PRD要件: 0.8秒以上の無音で分節
  volumeThreshold = 10,
  enabled = true
}: VADOptions = {}) {
  const [state, setState] = useState<VADState>({
    isListening: false,
    isRecording: false,
    volume: 0,
    error: null
  });

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const isRecordingRef = useRef<boolean>(false);

  // 音声レベル監視
  const analyzeAudio = useCallback(() => {
    if (!analyzerRef.current || !enabled) return;

    const bufferLength = analyzerRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyzerRef.current.getByteFrequencyData(dataArray);

    // 音量レベル計算（0-100）
    const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
    const volume = Math.round((average / 255) * 100);

    setState(prev => ({ ...prev, volume }));
    onVolumeChange?.(volume);

    // 音声検出ロジック
    if (volume > volumeThreshold) {
      // 音声検出 - 録音開始
      if (!isRecordingRef.current) {
        startRecording();
      }
      
      // 無音タイマーをクリア
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    } else if (isRecordingRef.current) {
      // 無音検出 - タイマー開始
      if (!silenceTimerRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          stopRecording();
        }, silenceThreshold);
      }
    }

    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  }, [enabled, volumeThreshold, silenceThreshold, onVolumeChange]);

  // 録音開始
  const startRecording = useCallback(() => {
    if (!mediaRecorderRef.current || isRecordingRef.current) return;

    audioChunksRef.current = [];
    isRecordingRef.current = true;

    setState(prev => ({ ...prev, isRecording: true }));
    onSpeechStart?.();

    mediaRecorderRef.current.start();
    console.log('VAD: Recording started');
  }, [onSpeechStart]);

  // 録音停止
  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !isRecordingRef.current) return;

    isRecordingRef.current = false;
    setState(prev => ({ ...prev, isRecording: false }));

    mediaRecorderRef.current.stop();
    console.log('VAD: Recording stopped');
  }, []);

  // VAD開始
  const startVAD = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));

      // マイクアクセス許可取得
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      mediaStreamRef.current = stream;

      // AudioContext セットアップ
      audioContextRef.current = new AudioContext();
      analyzerRef.current = audioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 256;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyzerRef.current);

      // MediaRecorder セットアップ
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onSpeechEnd?.(audioBlob);
      };

      setState(prev => ({ ...prev, isListening: true }));
      
      // 音声分析開始
      analyzeAudio();

      console.log('VAD: Started successfully');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage }));
      console.error('VAD: Failed to start:', error);
    }
  }, [analyzeAudio, onSpeechEnd]);

  // VAD停止
  const stopVAD = useCallback(() => {
    // タイマークリア
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    // アニメーションフレームクリア
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // 録音停止
    if (isRecordingRef.current) {
      stopRecording();
    }

    // メディアストリーム停止
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // AudioContext停止
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      analyzerRef.current = null;
    }

    // MediaRecorder停止
    mediaRecorderRef.current = null;
    isRecordingRef.current = false;

    setState({
      isListening: false,
      isRecording: false,
      volume: 0,
      error: null
    });

    console.log('VAD: Stopped');
  }, [stopRecording]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      stopVAD();
    };
  }, [stopVAD]);

  // 手動録音制御
  const manualStartRecording = useCallback(() => {
    if (state.isListening && !state.isRecording) {
      startRecording();
    }
  }, [state.isListening, state.isRecording, startRecording]);

  const manualStopRecording = useCallback(() => {
    if (state.isRecording) {
      stopRecording();
    }
  }, [state.isRecording, stopRecording]);

  return {
    ...state,
    startVAD,
    stopVAD,
    manualStartRecording,
    manualStopRecording,
    // 設定更新
    updateSettings: useCallback((newSettings: Partial<VADOptions>) => {
      // 実装時は設定を更新
      console.log('VAD settings updated:', newSettings);
    }, [])
  };
}