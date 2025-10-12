'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface MicRequestResponse {
  shipment_id: string;
  status: string;
}

export default function MicRequestPage() {
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestResult, setRequestResult] = useState<MicRequestResponse | null>(null);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);

  const requestMic = async () => {
    if (!agreed) {
      setError('利用規約に同意してください');
      return;
    }

    setIsRequesting(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/mic/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('マイク申込に失敗しました');
      }

      const data: MicRequestResponse = await response.json();
      setRequestResult(data);

    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setIsRequesting(false);
    }
  };

  if (requestResult) {
    return (
      <div className="mic-request-container">
        <div className="settings-header">
          <h1>マイク申込</h1>
          <Link href="/settings" className="back-button">
            ← 設定に戻る
          </Link>
        </div>

        <div className="request-success">
          <div className="success-icon">✅</div>
          <h2>申込完了しました！</h2>
          
          <div className="shipment-info">
            <h3>出荷情報</h3>
            <div className="info-item">
              <span>申込ID:</span>
              <span>{requestResult.shipment_id}</span>
            </div>
            <div className="info-item">
              <span>ステータス:</span>
              <span className="status pending">{requestResult.status}</span>
            </div>
          </div>

          <div className="next-steps">
            <h3>今後の流れ</h3>
            <ol>
              <li>住所確認のメールをお送りします（24時間以内）</li>
              <li>住所確認後、3-5営業日で発送いたします</li>
              <li>到着から14日間の無料お試し期間が開始されます</li>
              <li>お試し期間終了前に返却または¥1,000で買取をお選びください</li>
            </ol>
          </div>

          <div className="important-notice">
            <h4>⚠️ 重要なお知らせ</h4>
            <p>
              マイクを返却されない場合、自動的に¥1,000の買取料金が発生します。
              返却をご希望の場合は、お試し期間終了の3日前までにご連絡ください。
            </p>
          </div>

          <Link href="/settings" className="primary-button">
            設定に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mic-request-container">
      <div className="settings-header">
        <h1>マイク申込</h1>
        <Link href="/settings" className="back-button">
          ← 設定に戻る
        </Link>
      </div>

      <div className="request-content">
        <div className="mic-info">
          <h2>高品質マイクのレンタル</h2>
          <p className="mic-description">
            より正確な音声認識のために、高品質な外部マイクをお試しいただけます。
            14日間の無料お試し期間後、返却または買取（¥1,000）をお選びいただけます。
          </p>

          <div className="mic-features">
            <h3>マイクの特徴</h3>
            <ul>
              <li>🎙️ 高感度指向性マイク</li>
              <li>🔇 ノイズキャンセリング機能</li>
              <li>📱 USB-C接続（変換アダプタ付属）</li>
              <li>⚡ プラグ＆プレイ対応</li>
              <li>💪 軽量・コンパクト設計</li>
            </ul>
          </div>

          <div className="pricing-info">
            <h3>料金体系</h3>
            <div className="price-card">
              <div className="trial-period">
                <h4>14日間 無料お試し</h4>
                <p>到着日から14日間、完全に無料でお試しいただけます</p>
              </div>
              <div className="after-trial">
                <h4>お試し期間後</h4>
                <div className="options">
                  <div className="option">
                    <strong>返却</strong>
                    <span>送料お客様負担で返却</span>
                  </div>
                  <div className="option">
                    <strong>買取 ¥1,000</strong>
                    <span>そのままご利用いただけます</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="request-form">
          <div className="agreement-section">
            <label className="agreement-label">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="agreement-checkbox"
              />
              <span className="checkmark"></span>
              <span className="agreement-text">
                <Link href="/terms" target="_blank">利用規約</Link>
                および
                <Link href="/privacy" target="_blank">プライバシーポリシー</Link>
                に同意します
              </span>
            </label>
          </div>

          <button
            onClick={requestMic}
            disabled={isRequesting || !agreed}
            className="primary-button"
          >
            {isRequesting ? '申込中...' : 'マイクを申し込む'}
          </button>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}
        </div>

        <div className="faq-section">
          <h3>よくある質問</h3>
          <details className="faq-item">
            <summary>お試し期間中に返却したい場合はどうすればいいですか？</summary>
            <p>
              お試し期間終了の3日前までに、アプリ内または customer@anshin-display.jp までご連絡ください。
              返却用の送料はお客様負担となります。
            </p>
          </details>
          <details className="faq-item">
            <summary>マイクを紛失・破損した場合はどうなりますか？</summary>
            <p>
              紛失・破損の場合は、¥3,000の損害金をご請求させていただきます。
              詳細は利用規約をご確認ください。
            </p>
          </details>
          <details className="faq-item">
            <summary>対応デバイスは何ですか？</summary>
            <p>
              USB-C端子を持つタブレット・スマートフォンに対応しています。
              Lightning端子用の変換アダプタも付属しているため、iPhoneやiPadでもご利用いただけます。
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}