'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface PairResponse {
  pair_token: string;
  pair_code: string;
  expires_at: string;
}

export default function DevicePairingPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pairData, setPairData] = useState<PairResponse | null>(null);
  const [deviceName, setDeviceName] = useState('');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // クライアントサイドQRコード生成（qrcode.jsライブラリ使用想定）
  const generateQRCode = async (pairCode: string) => {
    try {
      const canvas = qrCanvasRef.current;
      if (!canvas) return;
      
      // QRコードデータ（PRD要件: ペアリングトークンを含む）
      const qrData = JSON.stringify({
        action: 'device_pairing',
        pair_code: pairCode,
        service: 'anshin_display',
        timestamp: Date.now()
      });
      
      // 簡易QRコード生成（実装時はqrcode.jsライブラリを使用）
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = 200;
      canvas.height = 200;
      
      // 白背景
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 200, 200);
      
      // 簡易QRコードパターン（実際はqrcode.jsで生成）
      ctx.fillStyle = '#000000';
      
      // コーナーファインダーパターン
      const drawFinderPattern = (x: number, y: number) => {
        ctx.fillRect(x, y, 21, 21);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 3, y + 3, 15, 15);
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 6, y + 6, 9, 9);
      };
      
      drawFinderPattern(10, 10);
      drawFinderPattern(10, 169);
      drawFinderPattern(169, 10);
      
      // ペアリングコードをテキストでも表示
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(pairCode, 100, 190);
      
    } catch (error) {
      console.error('QRコード生成エラー:', error);
      // エラー表示
      const canvas = qrCanvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = 200;
      canvas.height = 200;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 200, 200);
      ctx.fillStyle = '#000000';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('QRコード生成中...', 100, 100);
    }
  };

  // ペアリングリクエスト
  const requestPairing = async () => {
    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/device/pair/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_name: deviceName || 'デフォルトデバイス'
        }),
      });

      if (!response.ok) {
        throw new Error('ペアリングリクエストに失敗しました');
      }

      const data: PairResponse = await response.json();
      setPairData(data);
      
      // 有効期限タイマー設定（15分）
      setTimeLeft(15 * 60);
      
      // 実際のQRコード生成
      generateQRCode(data.pair_code);

    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setIsGenerating(false);
    }
  };

  // タイマー更新
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && pairData) {
      setPairData(null);
    }
  }, [timeLeft, pairData]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="device-pairing-container">
      <div className="settings-header">
        <h1>デバイスペアリング</h1>
        <Link href="/settings" className="back-button">
          ← 設定に戻る
        </Link>
      </div>

      <div className="pairing-content">
        {!pairData ? (
          <div className="pairing-setup">
            <h2>新しいデバイスをペアリング</h2>
            <p className="pairing-description">
              タブレット端末やスマートフォンを「あんしんディスプレイ」に接続できます。
              QRコードまたは6桁のコードでペアリングを行います。
            </p>

            <div className="form-group">
              <label htmlFor="deviceName">デバイス名（オプション）</label>
              <input
                id="deviceName"
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="例: iPad Pro, スマートフォン"
                className="device-input"
              />
            </div>

            <button
              onClick={requestPairing}
              disabled={isGenerating}
              className="primary-button"
            >
              {isGenerating ? 'QRコード生成中...' : 'ペアリングを開始'}
            </button>

            {error && (
              <div className="error-message">
                ❌ {error}
              </div>
            )}
          </div>
        ) : (
          <div className="pairing-active">
            <h2>ペアリング待機中</h2>
            <p className="time-left">有効期限: {formatTime(timeLeft)}</p>

            <div className="pairing-methods">
              <div className="qr-section">
                <h3>QRコードをスキャン</h3>
                <canvas ref={qrCanvasRef} className="qr-canvas"></canvas>
              </div>

              <div className="code-section">
                <h3>または6桁コードを入力</h3>
                <div className="pair-code">
                  {pairData.pair_code}
                </div>
                <p className="code-instruction">
                  デバイスのアプリでこのコードを入力してください
                </p>
              </div>
            </div>

            <button
              onClick={() => setPairData(null)}
              className="secondary-button"
            >
              キャンセル
            </button>
          </div>
        )}

        <div className="pairing-help">
          <h3>ペアリングについて</h3>
          <ul>
            <li>ペアリング用QRコード/コードの有効期限は15分です</li>
            <li>接続するデバイスでも「あんしんディスプレイ」アプリが必要です</li>
            <li>ペアリング後は自動的に翻訳データが同期されます</li>
            <li>セキュリティのため、信頼できるデバイスのみ接続してください</li>
          </ul>
        </div>
      </div>
    </div>
  );
}