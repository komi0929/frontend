'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardStats {
  today: { message_count: number; session_count: number };
  this_week: { message_count: number; session_count: number };
  this_month: { message_count: number; session_count: number };
  language_distribution: Record<string, number>;
  peak_hours: { hour: number; count: number }[];
}

interface MicShipment {
  id: string;
  user_id: string;
  status: string;
  address: string;
  shipped_at?: string;
  returned_at?: string;
  carrier?: string;
  tracking_number?: string;
  expected_arrival_date?: string;
  buyout_at?: string;
  created_at: string;
}

interface Device {
  id: string;
  user_id: string;
  name?: string;
  paired_at?: string;
  last_seen_at?: string;
  trusted: boolean;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [shipments, setShipments] = useState<MicShipment[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'shipments' | 'devices'>('dashboard');

  // データ取得
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // 統計データ取得
      const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/dashboard/stats`);
      const statsData = await statsRes.json();
      setStats(statsData);

      // 仮のデータ（実際にはAPIから取得）
      setShipments([
        {
          id: '1',
          user_id: 'user_001',
          status: 'shipped',
          address: '東京都渋谷区...',
          shipped_at: '2024-10-05T10:00:00Z',
          carrier: 'ヤマト運輸',
          tracking_number: '1234567890',
          expected_arrival_date: '2024-10-07T00:00:00Z',
          created_at: '2024-10-01T09:00:00Z'
        },
        {
          id: '2',
          user_id: 'user_002',
          status: 'pending',
          address: '大阪府大阪市...',
          created_at: '2024-10-08T14:30:00Z'
        }
      ]);

      setDevices([
        {
          id: 'dev_001',
          user_id: 'user_001',
          name: 'iPad Pro',
          paired_at: '2024-10-01T15:30:00Z',
          last_seen_at: '2024-10-09T08:45:00Z',
          trusted: true
        }
      ]);

    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyout = async (shipmentId: string) => {
    const confirmed = confirm('¥1,000の買取処理を実行しますか？');
    if (!confirmed) return;

    try {
      // 実際にはAPIを呼び出す
      console.log('Buy out shipment:', shipmentId);
      
      // 状態更新
      setShipments(prev => 
        prev.map(s => 
          s.id === shipmentId 
            ? { ...s, status: 'kept', buyout_at: new Date().toISOString() }
            : s
        )
      );
      
      alert('買取処理が完了しました');
    } catch (error) {
      console.error('買取処理エラー:', error);
      alert('買取処理に失敗しました');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: '準備中', class: 'status-pending' },
      shipped: { label: '発送済み', class: 'status-shipped' },
      returned: { label: '返却済み', class: 'status-returned' },
      kept: { label: '買取済み', class: 'status-kept' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, class: 'status-unknown' };
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">データを読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>管理ダッシュボード</h1>
        <Link href="/display" className="back-to-app">
          ← アプリに戻る
        </Link>
      </div>

      <div className="admin-tabs">
        <button
          className={activeTab === 'dashboard' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 ダッシュボード
        </button>
        <button
          className={activeTab === 'shipments' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('shipments')}
        >
          📦 マイク配送管理
        </button>
        <button
          className={activeTab === 'devices' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('devices')}
        >
          📱 デバイス管理
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-section">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>今日の利用状況</h3>
                <div className="stat-value">{stats?.today.message_count || 0}</div>
                <div className="stat-label">翻訳メッセージ数</div>
                <div className="stat-sub">{stats?.today.session_count || 0} セッション</div>
              </div>
              
              <div className="stat-card">
                <h3>今週の利用状況</h3>
                <div className="stat-value">{stats?.this_week.message_count || 0}</div>
                <div className="stat-label">翻訳メッセージ数</div>
                <div className="stat-sub">{stats?.this_week.session_count || 0} セッション</div>
              </div>
              
              <div className="stat-card">
                <h3>今月の利用状況</h3>
                <div className="stat-value">{stats?.this_month.message_count || 0}</div>
                <div className="stat-label">翻訳メッセージ数</div>
                <div className="stat-sub">{stats?.this_month.session_count || 0} セッション</div>
              </div>
            </div>

            <div className="dashboard-panels">
              <div className="panel">
                <h3>トライアル終了予定</h3>
                <div className="trial-info">
                  <div className="trial-date">2024年10月21日</div>
                  <div className="trial-days">あと12日</div>
                </div>
              </div>
              
              <div className="panel">
                <h3>QRペアリング</h3>
                <Link href="/settings/device-pairing" className="qr-button">
                  QRコード生成
                </Link>
              </div>
              
              <div className="panel">
                <h3>接続デバイス</h3>
                <div className="device-count">{devices.length}台</div>
                <div className="device-list">
                  {devices.slice(0, 2).map(device => (
                    <div key={device.id} className="device-mini">
                      {device.name || 'デバイス'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shipments' && (
          <div className="shipments-section">
            <div className="section-header">
              <h2>マイク配送管理</h2>
              <div className="shipment-stats">
                <span className="stat">全{shipments.length}件</span>
                <span className="stat">発送済み{shipments.filter(s => s.status === 'shipped').length}件</span>
              </div>
            </div>

            <div className="shipments-table-container">
              <table className="shipments-table">
                <thead>
                  <tr>
                    <th>申込ID</th>
                    <th>ユーザーID</th>
                    <th>ステータス</th>
                    <th>配送情報</th>
                    <th>到着予定</th>
                    <th>申込日時</th>
                    <th>アクション</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map(shipment => (
                    <tr key={shipment.id}>
                      <td className="mono-text">{shipment.id}</td>
                      <td className="mono-text">{shipment.user_id}</td>
                      <td>{getStatusBadge(shipment.status)}</td>
                      <td>
                        {shipment.carrier && (
                          <div>
                            <div>{shipment.carrier}</div>
                            <div className="tracking-number">{shipment.tracking_number}</div>
                          </div>
                        )}
                        {!shipment.carrier && <span className="no-data">未設定</span>}
                      </td>
                      <td>
                        {shipment.expected_arrival_date 
                          ? formatDate(shipment.expected_arrival_date)
                          : <span className="no-data">-</span>
                        }
                      </td>
                      <td>{formatDate(shipment.created_at)}</td>
                      <td>
                        {shipment.status === 'shipped' && !shipment.buyout_at && (
                          <button
                            onClick={() => handleBuyout(shipment.id)}
                            className="buyout-button"
                          >
                            ¥1,000買取
                          </button>
                        )}
                        {shipment.buyout_at && (
                          <span className="buyout-completed">買取済み</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'devices' && (
          <div className="devices-section">
            <div className="section-header">
              <h2>デバイス管理</h2>
              <Link href="/settings/device-pairing" className="add-device-button">
                + 新しいデバイス
              </Link>
            </div>

            <div className="devices-grid">
              {devices.map(device => (
                <div key={device.id} className="device-card">
                  <div className="device-header">
                    <h3>{device.name || 'デバイス'}</h3>
                    <span className={`device-status ${device.trusted ? 'trusted' : 'untrusted'}`}>
                      {device.trusted ? '信頼済み' : '未承認'}
                    </span>
                  </div>
                  <div className="device-details">
                    <div className="device-info">
                      <span>ID:</span>
                      <span className="mono-text">{device.id}</span>
                    </div>
                    <div className="device-info">
                      <span>ペアリング:</span>
                      <span>{device.paired_at ? formatDate(device.paired_at) : '-'}</span>
                    </div>
                    <div className="device-info">
                      <span>最終接続:</span>
                      <span>{device.last_seen_at ? formatDate(device.last_seen_at) : '-'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}