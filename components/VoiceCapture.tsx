'use client';

import React, { useState, useRef, useCallback } from 'react';

interface VoiceCaptureProps {
  onTranscription: (text: string, language: string) => void;
  onError?: (error: string) => void;
  enabled?: boolean;
  language?: string;
}

export default function VoiceCapture({ 
  onTranscription, 
  onError, 
  enabled = true,
  language = 'auto' 
}: VoiceCaptureProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    if (!enabled || isRecording) return;

    try {
      // マイクアクセス許可を要求
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });

      // MediaRecorder設定
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        
        try {
          // 音声データを結合
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Base64に変換
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            
            // STT APIに送信
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api'}/v1/stt`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                audio_data: base64Audio,
                language: language
              }),
            });

            if (!response.ok) {
              throw new Error('音声認識に失敗しました');
            }

            const result = await response.json();
            onTranscription(result.text, result.detected_language || language);
            
          };
          
          reader.readAsDataURL(audioBlob);
          
        } catch (error) {
          console.error('音声処理エラー:', error);
          onError?.(error instanceof Error ? error.message : '音声処理に失敗しました');
        } finally {
          setIsProcessing(false);
          
          // ストリーム停止
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

    } catch (error) {
      console.error('録音開始エラー:', error);
      onError?.(error instanceof Error ? error.message : 'マイクアクセスに失敗しました');
    }
  }, [enabled, isRecording, language, onTranscription, onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return (
    <div className="voice-capture">
      <button
        onClick={toggleRecording}
        disabled={!enabled || isProcessing}
        className={`voice-button ${isRecording ? 'recording' : ''} ${isProcessing ? 'processing' : ''}`}
      >
        {isProcessing ? (
          <div className="processing-indicator">
            <div className="spinner"></div>
            <span>認識中...</span>
          </div>
        ) : isRecording ? (
          <div className="recording-indicator">
            <div className="recording-pulse"></div>
            <span>録音中... タップで停止</span>
          </div>
        ) : (
          <div className="idle-indicator">
            <div className="mic-icon">🎤</div>
            <span>タップして話す</span>
          </div>
        )}
      </button>
    </div>
  );
}