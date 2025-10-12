'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardStats } from '../../types';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Next.js API Route または FastAPI経由で統計取得
      const response = await fetch('/api/v1/dashboard/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('統計データの取得に失敗しました');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Dashboard stats error:', err);
      
      // フォールバック: モックデータを表示
      setStats({
        today: { messageCount: 24, sessionCount: 6 },
        thisWeek: { messageCount: 156, sessionCount: 32 },
        thisMonth: { messageCount: 678, sessionCount: 142 },
        languageDistribution: { en: 45, ko: 32, zh: 23, ja: 0 },
        peakHours: [
          { hour: 11, count: 15 },
          { hour: 12, count: 23 },
          { hour: 13, count: 18 },
          { hour: 18, count: 21 },
          { hour: 19, count: 19 },
          { hour: 20, count: 12 }
        ],
        trialDaysRemaining: 12,
        nextBillingDate: '2024-10-21',
        nextBillingAmount: 990
      });
      setError('モックデータを表示しています');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-main)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p>統計データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">あんしんディスプレイ - ダッシュボード</h1>
        <Link 
          href="/display"
          className="px-4 py-2 rounded-lg transition-colors duration-200"
          style={{ 
            background: 'var(--accent-primary)', 
            color: 'var(--text-white)' 
          }}
        >
          ← アプリに戻る
        </Link>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--bg-error)', borderLeft: '4px solid var(--border-error)' }}>
          <p className="text-sm">⚠️ {error}</p>
        </div>
      )}

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-xl shadow-sm" style={{ background: 'var(--bg-card)' }}>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>今日</h2>
          <div className="text-3xl font-bold mb-1" style={{ color: 'var(--accent-primary)' }}>
            {stats?.today.messageCount || 0}
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            翻訳メッセージ / {stats?.today.sessionCount || 0} セッション
          </p>
        </div>

        <div className="p-6 rounded-xl shadow-sm" style={{ background: 'var(--bg-card)' }}>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>今週</h2>
          <div className="text-3xl font-bold mb-1" style={{ color: 'var(--accent-primary)' }}>
            {stats?.thisWeek.messageCount || 0}
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            翻訳メッセージ / {stats?.thisWeek.sessionCount || 0} セッション
          </p>
        </div>

        <div className="p-6 rounded-xl shadow-sm" style={{ background: 'var(--bg-card)' }}>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>今月</h2>
          <div className="text-3xl font-bold mb-1" style={{ color: 'var(--accent-primary)' }}>
            {stats?.thisMonth.messageCount || 0}
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            翻訳メッセージ / {stats?.thisMonth.sessionCount || 0} セッション
          </p>
        </div>
      </div>

      {/* 詳細パネル */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 言語別利用比率 */}
        <div className="p-6 rounded-xl shadow-sm" style={{ background: 'var(--bg-card)' }}>
          <h2 className="text-xl font-semibold mb-4">言語別利用比率</h2>
          <div className="space-y-3">
            {Object.entries(stats?.languageDistribution || {}).map(([lang, count]) => {
              const total = Object.values(stats?.languageDistribution || {}).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
              const langName = { en: 'English', ko: '한국어', zh: '中文', ja: '日本語' }[lang] || lang;
              
              return (
                <div key={lang} className="flex items-center justify-between">
                  <span className="font-medium">{langName}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-300"
                        style={{ 
                          width: `${percentage}%`,
                          background: 'var(--accent-primary)'
                        }}
                      />
                    </div>
                    <span className="text-sm w-12 text-right" style={{ color: 'var(--text-secondary)' }}>
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ピーク時間帯 */}
        <div className="p-6 rounded-xl shadow-sm" style={{ background: 'var(--bg-card)' }}>
          <h2 className="text-xl font-semibold mb-4">ピーク時間帯</h2>
          <div className="space-y-3">
            {(stats?.peakHours || []).map(({ hour, count }) => {
              const maxCount = Math.max(...(stats?.peakHours || []).map(h => h.count));
              const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
              
              return (
                <div key={hour} className="flex items-center justify-between">
                  <span className="font-medium">{hour}:00-{hour + 1}:00</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-300"
                        style={{ 
                          width: `${barWidth}%`,
                          background: 'var(--bar-customer)'
                        }}
                      />
                    </div>
                    <span className="text-sm w-8 text-right" style={{ color: 'var(--text-secondary)' }}>
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* トライアル状況 */}
        {stats?.trialDaysRemaining !== undefined && (
          <div className="p-6 rounded-xl shadow-sm" style={{ background: 'var(--bg-card)' }}>
            <h2 className="text-xl font-semibold mb-4">トライアル状況</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>残り日数</span>
                <span className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>
                  {stats.trialDaysRemaining}日
                </span>
              </div>
              {stats.nextBillingDate && (
                <div className="flex justify-between items-center">
                  <span>次回請求日</span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {new Date(stats.nextBillingDate).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              )}
              {stats.nextBillingAmount && (
                <div className="flex justify-between items-center">
                  <span>請求金額</span>
                  <span className="font-semibold">¥{stats.nextBillingAmount.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stripeカスタマーポータル */}
        <div className="p-6 rounded-xl shadow-sm" style={{ background: 'var(--bg-card)' }}>
          <h2 className="text-xl font-semibold mb-4">課金管理</h2>
          <div className="space-y-3">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              支払い方法の変更、請求履歴の確認、サブスクリプションの管理ができます。
            </p>
            <button
              onClick={() => {
                // 実際にはStripe Customer Portalへのリンクを生成
                alert('Stripe Customer Portalへリダイレクトします（実装中）');
              }}
              className="w-full py-3 px-4 rounded-lg font-semibold transition-colors duration-200"
              style={{ 
                background: 'var(--accent-primary)', 
                color: 'var(--text-white)' 
              }}
            >
              課金管理ページを開く
            </button>
          </div>
        </div>
      </div>

      {/* 設定へのリンク */}
      <div className="mt-8 text-center">
        <Link 
          href="/settings"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-colors duration-200"
          style={{ 
            background: 'var(--accent-secondary)', 
            color: 'var(--text-primary)' 
          }}
        >
          ⚙️ 設定画面へ
        </Link>
      </div>
    </div>
  );
}