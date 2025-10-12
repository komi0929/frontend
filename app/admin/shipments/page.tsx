'use client';

import React, { useState } from 'react';
import Link from 'next/link';

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

export default function ShipmentManagement() {
  const [shipments, setShipments] = useState<MicShipment[]>([
    {
      id: 'ship_001',
      user_id: 'user_001',
      status: 'pending',
      address: '東京都渋谷区神南1-1-1',
      created_at: '2024-10-01T09:00:00Z'
    },
    {
      id: 'ship_002',
      user_id: 'user_002', 
      status: 'shipped',
      address: '大阪府大阪市北区梅田1-1-1',
      shipped_at: '2024-10-05T10:00:00Z',
      carrier: 'ヤマト運輸',
      tracking_number: '1234567890',
      expected_arrival_date: '2024-10-07T00:00:00Z',
      created_at: '2024-10-03T14:30:00Z'
    }
  ]);

  const [editingShipment, setEditingShipment] = useState<string | null>(null);
  const [shippingForm, setShippingForm] = useState({
    carrier: '',
    tracking_number: '',
    expected_arrival_date: ''
  });

  // 配送情報更新＋動的trial_end調整
  const updateShippingInfo = async (shipmentId: string) => {
    try {
      // 1. 配送情報を更新
      const updatedShipment = {
        ...shipments.find(s => s.id === shipmentId)!,
        status: 'shipped',
        shipped_at: new Date().toISOString(),
        carrier: shippingForm.carrier,
        tracking_number: shippingForm.tracking_number,
        expected_arrival_date: shippingForm.expected_arrival_date
      };

      // 2. 動的trial_end調整APIを呼び出し
      const trialDeferResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api'}/internal/stripe/trial/defer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription_id: `sub_${updatedShipment.user_id}`, // 実際にはユーザーのsubscription_idを使用
          expected_arrival_date: shippingForm.expected_arrival_date
        }),
      });

      if (!trialDeferResponse.ok) {
        throw new Error('Trial期間調整に失敗しました');
      }

      const trialData = await trialDeferResponse.json();
      console.log('Trial期間更新完了:', trialData.trial_end);

      // 3. ローカル状態を更新
      setShipments(prev => 
        prev.map(s => 
          s.id === shipmentId ? updatedShipment : s
        )
      );

      setEditingShipment(null);
      setShippingForm({ carrier: '', tracking_number: '', expected_arrival_date: '' });
      
      alert(`配送情報を更新しました。\nTrial終了日: ${new Date(trialData.trial_end).toLocaleDateString('ja-JP')}`);
      
    } catch (error) {
      console.error('更新エラー:', error);
      alert('更新に失敗しました: ' + (error as Error).message);
    }
  };

  // 買取処理
  const processBuyout = async (shipmentId: string) => {
    const confirmed = confirm('¥1,000の買取処理を実行しますか？この操作は取り消せません。');
    if (!confirmed) return;

    try {
      // 実際にはStripe APIで請求処理を実行
      console.log('Processing buyout for shipment:', shipmentId);
      
      // 買取完了状態に更新
      setShipments(prev => 
        prev.map(s => 
          s.id === shipmentId 
            ? { ...s, status: 'kept', buyout_at: new Date().toISOString() }
            : s
        )
      );
      
      alert('¥1,000の買取処理が完了しました。');
    } catch (error) {
      console.error('買取処理エラー:', error);
      alert('買取処理に失敗しました');
    }
  };

  const startEditing = (shipment: MicShipment) => {
    setEditingShipment(shipment.id);
    setShippingForm({
      carrier: shipment.carrier || '',
      tracking_number: shipment.tracking_number || '',
      expected_arrival_date: shipment.expected_arrival_date?.split('T')[0] || ''
    });
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

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>配送管理</h1>
        <Link href="/admin" className="back-button">
          ← 管理ダッシュボード
        </Link>
      </div>

      <div className="shipment-management">
        <div className="management-header">
          <h2>マイク配送詳細管理</h2>
          <div className="summary">
            <span className="summary-item">全{shipments.length}件</span>
            <span className="summary-item">準備中{shipments.filter(s => s.status === 'pending').length}件</span>
            <span className="summary-item">発送済み{shipments.filter(s => s.status === 'shipped').length}件</span>
          </div>
        </div>

        <div className="shipments-detailed">
          {shipments.map(shipment => (
            <div key={shipment.id} className="shipment-card">
              <div className="shipment-header">
                <div className="shipment-id">申込ID: {shipment.id}</div>
                <div className="shipment-status">{getStatusBadge(shipment.status)}</div>
              </div>

              <div className="shipment-details">
                <div className="detail-row">
                  <span>ユーザーID:</span>
                  <span className="mono-text">{shipment.user_id}</span>
                </div>
                <div className="detail-row">
                  <span>配送先:</span>
                  <span>{shipment.address}</span>
                </div>
                <div className="detail-row">
                  <span>申込日時:</span>
                  <span>{formatDate(shipment.created_at)}</span>
                </div>

                {shipment.status === 'pending' && editingShipment === shipment.id ? (
                  <div className="shipping-form">
                    <h4>配送情報入力</h4>
                    <div className="form-grid">
                      <div className="form-field">
                        <label>配送業者</label>
                        <select
                          value={shippingForm.carrier}
                          onChange={(e) => setShippingForm(prev => ({ ...prev, carrier: e.target.value }))}
                        >
                          <option value="">選択してください</option>
                          <option value="ヤマト運輸">ヤマト運輸</option>
                          <option value="佐川急便">佐川急便</option>
                          <option value="日本郵便">日本郵便</option>
                        </select>
                      </div>
                      <div className="form-field">
                        <label>追跡番号</label>
                        <input
                          type="text"
                          value={shippingForm.tracking_number}
                          onChange={(e) => setShippingForm(prev => ({ ...prev, tracking_number: e.target.value }))}
                          placeholder="1234567890"
                        />
                      </div>
                      <div className="form-field">
                        <label>到着予定日 📅</label>
                        <input
                          type="date"
                          value={shippingForm.expected_arrival_date}
                          onChange={(e) => setShippingForm(prev => ({ ...prev, expected_arrival_date: e.target.value }))}
                        />
                        <small className="form-note">
                          ⚠️ この日付を基準にTrial期間が自動調整されます（+14日）
                        </small>
                      </div>
                    </div>
                    <div className="form-actions">
                      <button
                        onClick={() => updateShippingInfo(shipment.id)}
                        className="save-button"
                        disabled={!shippingForm.carrier || !shippingForm.tracking_number || !shippingForm.expected_arrival_date}
                      >
                        発送完了 & Trial期間調整
                      </button>
                      <button
                        onClick={() => setEditingShipment(null)}
                        className="cancel-button"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : shipment.status === 'pending' ? (
                  <div className="pending-actions">
                    <button
                      onClick={() => startEditing(shipment)}
                      className="edit-button"
                    >
                      配送情報を入力
                    </button>
                  </div>
                ) : (
                  <div className="shipped-info">
                    {shipment.shipped_at && (
                      <div className="detail-row">
                        <span>発送日時:</span>
                        <span>{formatDate(shipment.shipped_at)}</span>
                      </div>
                    )}
                    {shipment.carrier && (
                      <div className="detail-row">
                        <span>配送業者:</span>
                        <span>{shipment.carrier}</span>
                      </div>
                    )}
                    {shipment.tracking_number && (
                      <div className="detail-row">
                        <span>追跡番号:</span>
                        <span className="mono-text">{shipment.tracking_number}</span>
                      </div>
                    )}
                    {shipment.expected_arrival_date && (
                      <div className="detail-row">
                        <span>到着予定:</span>
                        <span>{formatDate(shipment.expected_arrival_date)}</span>
                      </div>
                    )}
                    
                    {shipment.status === 'shipped' && !shipment.buyout_at && (
                      <div className="buyout-section">
                        <div className="buyout-info">
                          <h4>買取オプション</h4>
                          <p>お客様がマイクを返却しない場合、¥1,000で自動買取となります。</p>
                        </div>
                        <button
                          onClick={() => processBuyout(shipment.id)}
                          className="buyout-action-button"
                        >
                          ¥1,000買取処理を実行
                        </button>
                      </div>
                    )}

                    {shipment.buyout_at && (
                      <div className="buyout-completed">
                        <h4>✅ 買取完了</h4>
                        <div className="detail-row">
                          <span>買取日時:</span>
                          <span>{formatDate(shipment.buyout_at)}</span>
                        </div>
                        <div className="buyout-amount">買取金額: ¥1,000</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}