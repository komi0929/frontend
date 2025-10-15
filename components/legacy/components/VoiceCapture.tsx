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
      // 繝槭う繧ｯ繧｢繧ｯ繧ｻ繧ｹ險ｱ蜿ｯ繧定ｦ∵ｱ・      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });

      // MediaRecorder險ｭ螳・      const mediaRecorder = new MediaRecorder(stream, {
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
          // 髻ｳ螢ｰ繝・・繧ｿ繧堤ｵ仙粋
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Base64縺ｫ螟画鋤
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            
            // STT API縺ｫ騾∽ｿ｡
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
              throw new Error('髻ｳ螢ｰ隱崎ｭ倥↓螟ｱ謨励＠縺ｾ縺励◆');
            }

            const result = await response.json();
            onTranscription(result.text, result.detected_language || language);
            
          };
          
          reader.readAsDataURL(audioBlob);
          
        } catch (error) {
          console.error('髻ｳ螢ｰ蜃ｦ逅・お繝ｩ繝ｼ:', error);
          onError?.(error instanceof Error ? error.message : '髻ｳ螢ｰ蜃ｦ逅・↓螟ｱ謨励＠縺ｾ縺励◆');
        } finally {
          setIsProcessing(false);
          
          // 繧ｹ繝医Μ繝ｼ繝蛛懈ｭ｢
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

    } catch (error) {
      console.error('骭ｲ髻ｳ髢句ｧ九お繝ｩ繝ｼ:', error);
      onError?.(error instanceof Error ? error.message : '繝槭う繧ｯ繧｢繧ｯ繧ｻ繧ｹ縺ｫ螟ｱ謨励＠縺ｾ縺励◆');
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
            <span>隱崎ｭ倅ｸｭ...</span>
          </div>
        ) : isRecording ? (
          <div className="recording-indicator">
            <div className="recording-pulse"></div>
            <span>骭ｲ髻ｳ荳ｭ... 繧ｿ繝・・縺ｧ蛛懈ｭ｢</span>
          </div>
        ) : (
          <div className="idle-indicator">
            <div className="mic-icon">痔</div>
            <span>繧ｿ繝・・縺励※隧ｱ縺・/span>
          </div>
        )}
      </button>
    </div>
  );
}
