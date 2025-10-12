'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PinLock from '../../components/PinLock';

export default function SettingsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    // PRD要件: 初回起動時PIN変更強制
    const hasCustomPin = localStorage.getItem('hasCustomPin');
    if (!hasCustomPin) {
      setIsFirstTime(true);
    }
  }, []);

  const handlePinSuccess = () => {
    setIsAuthenticated(true);
  };

  const handlePinBack = () => {
    window.history.back();
  };

  if (!isAuthenticated) {
    return (
      <PinLock 
        onSuccess={handlePinSuccess}
        onBack={handlePinBack}
        title="設定"
        isFirstTime={isFirstTime}
      />
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>設定</h1>
        <Link href="/display" className="back-button">
          ← 戻る
        </Link>
      </div>

      <div className="settings-content">
        {/* アプリ情報セクション */}
        <section className="settings-section">
          <h2>アプリについて</h2>
          <div className="setting-item">
            <span>アプリ名</span>
            <span>あんしんディスプレイ</span>
          </div>
          <div className="setting-item">
            <span>バージョン</span>
            <span>2.1.0</span>
          </div>
        </section>

        {/* デバイス管理セクション */}
        <section className="settings-section">
          <h2>デバイス管理</h2>
          <div className="setting-item clickable">
            <Link href="/settings/device-pairing" className="setting-link">
              <span>デバイスペアリング</span>
              <span>→</span>
            </Link>
          </div>
          <div className="setting-item">
            <span>接続済みデバイス</span>
            <span>0台</span>
          </div>
        </section>

        {/* マイク管理セクション */}
        <section className="settings-section">
          <h2>マイク管理</h2>
          <div className="setting-item clickable">
            <Link href="/settings/mic-request" className="setting-link">
              <span>マイク申込</span>
              <span>→</span>
            </Link>
          </div>
          <div className="setting-item">
            <span>レンタル状況</span>
            <span>未申込</span>
          </div>
        </section>

        {/* PRD準拠: 詳細設定画面 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>デバイス設定</h2>
          
          {/* マイク選択 */}
          <div className="mb-6">
            <label className="block text-base font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
              マイク
            </label>
            <div className="p-4 bg-white rounded-lg shadow-sm border-2" style={{ borderColor: 'var(--accent-primary)' }}>
              <select 
                className="w-full p-2 border-none outline-none bg-transparent text-base"
                style={{ color: 'var(--text-primary)' }}
              >
                <option value="default">内蔵マイク ✓</option>
                <option value="external">外部マイク（未接続）</option>
                <option value="bluetooth">Bluetoothマイク（未接続）</option>
              </select>
            </div>
          </div>

          {/* 画面の明るさ */}
          <div className="mb-6">
            <label className="block text-base font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
              画面の明るさ
            </label>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="20" 
                  max="100" 
                  defaultValue="80"
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--accent-primary) 0%, var(--accent-primary) 80%, #E5E7EB 80%, #E5E7EB 100%)`
                  }}
                  onChange={(e) => {
                    const value = e.target.value;
                    document.body.style.filter = `brightness(${value}%)`;
                  }}
                />
                <span className="text-lg font-semibold w-16 text-right" style={{ color: 'var(--text-primary)' }}>
                  80%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 基本設定 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>機能設定</h2>
          
          <div className="space-y-4">
            {/* 音声フィードバック */}
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <div>
                <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>音声フィードバック</span>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>翻訳完了時に効果音を再生</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {/* 自動翻訳 */}
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <div>
                <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>自動翻訳</span>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>音声検出時に自動で翻訳開始</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* 会話履歴クリア */}
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>会話履歴をクリア</span>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>保存されている全ての会話を削除します</p>
                </div>
                <button 
                  className="px-4 py-2 rounded-lg font-semibold transition-colors duration-200 hover:scale-105"
                  style={{ background: 'var(--accent-secondary)', color: 'var(--text-primary)' }}
                  onClick={() => {
                    if (confirm('会話履歴を全て削除しますか？この操作は取り消せません。')) {
                      localStorage.removeItem('conversationHistory');
                      alert('会話履歴を削除しました。');
                    }
                  }}
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* サポート・法的情報セクション */}
        <section className="settings-section">
          <h2>サポート・法的情報</h2>
          <div className="setting-item clickable">
            <Link href="/terms" className="setting-link">
              <span>利用規約</span>
              <span>→</span>
            </Link>
          </div>
          <div className="setting-item clickable">
            <Link href="/privacy" className="setting-link">
              <span>プライバシーポリシー</span>
              <span>→</span>
            </Link>
          </div>
          <div className="setting-item clickable">
            <Link href="/legal" className="setting-link">
              <span>法的情報</span>
              <span>→</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}