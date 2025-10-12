import { NextRequest, NextResponse } from 'next/server';

// ダッシュボード統計API - PRD v2.1準拠
export const maxDuration = 10; // Vercel関数タイムアウト対策

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all';
    const format = searchParams.get('format') || 'json';

    // モック統計データ - 実装時は実際のデータベースから取得
    const mockStats = {
      today: {
        messageCount: 127,
        sessionCount: 23,
        averageSessionDuration: 8.5, // 分
        peakHour: 14, // 14時
        languageBreakdown: {
          en: 45,
          ko: 38,
          zh: 31,
          ja: 13
        }
      },
      thisWeek: {
        messageCount: 856,
        sessionCount: 134,
        averageSessionDuration: 9.2,
        totalDuration: 1232.8, // 分
        languageBreakdown: {
          en: 298,
          ko: 267,
          zh: 203,
          ja: 88
        }
      },
      thisMonth: {
        messageCount: 3421,
        sessionCount: 567,
        averageSessionDuration: 8.8,
        totalDuration: 4989.6, // 分
        languageBreakdown: {
          en: 1184,
          ko: 1095,
          zh: 821,
          ja: 321
        }
      },
      languageDistribution: {
        en: 34.6, // %
        ko: 32.0,
        zh: 24.0,
        ja: 9.4
      },
      peakHours: [
        { hour: 10, count: 89, percentage: 12.3 },
        { hour: 11, count: 95, percentage: 13.1 },
        { hour: 12, count: 78, percentage: 10.8 },
        { hour: 13, count: 102, percentage: 14.1 },
        { hour: 14, count: 134, percentage: 18.5 }, // ピーク
        { hour: 15, count: 98, percentage: 13.5 },
        { hour: 16, count: 76, percentage: 10.5 },
        { hour: 17, count: 52, percentage: 7.2 }
      ],
      trialInfo: {
        isTrialActive: true,
        trialDaysRemaining: 12,
        trialStartDate: '2024-09-28',
        trialEndDate: '2024-10-28',
        messagesUsed: 3421,
        messagesLimit: 5000,
        usagePercentage: 68.4
      },
      billingInfo: {
        currentPlan: 'Pro',
        nextBillingDate: '2024-10-21',
        nextBillingAmount: 990, // 円
        paymentMethod: '**** **** **** 1234',
        status: 'active'
      },
      deviceInfo: {
        connectedDevices: 2,
        pairedDevices: [
          {
            id: 'tablet_001',
            name: 'iPad Pro 12.9"',
            lastSeen: '2024-10-09T15:30:00Z',
            location: 'フロント',
            status: 'online'
          },
          {
            id: 'tablet_002',
            name: 'Surface Pro',
            lastSeen: '2024-10-09T14:45:00Z',
            location: 'サブカウンター',
            status: 'idle'
          }
        ]
      },
      micRental: {
        activeRentals: 1,
        pendingReturns: 0,
        totalRented: 3,
        currentRental: {
          id: 'mic_rental_001',
          deviceType: 'ワイヤレスマイク Pro',
          rentalStart: '2024-09-15',
          status: 'active',
          monthlyFee: 300
        }
      }
    };

    // 期間フィルタリング
    let responseData: any = mockStats;
    
    if (period === 'today') {
      responseData = { 
        today: mockStats.today,
        languageDistribution: mockStats.languageDistribution 
      };
    } else if (period === 'week') {
      responseData = { 
        thisWeek: mockStats.thisWeek,
        languageDistribution: mockStats.languageDistribution 
      };
    } else if (period === 'month') {
      responseData = { 
        thisMonth: mockStats.thisMonth,
        languageDistribution: mockStats.languageDistribution 
      };
    }

    // CSV形式での出力対応
    if (format === 'csv') {
      const csvData = generateCSV(responseData);
      return new NextResponse(csvData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="dashboard-stats-${period}-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      generated_at: new Date().toISOString(),
      period: period,
      note: 'モックデータ - 本番環境では実際のデータベースから取得'
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve dashboard statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - ダッシュボード設定更新
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'update_settings':
        return NextResponse.json({
          success: true,
          message: 'Dashboard settings updated',
          updatedAt: new Date().toISOString()
        });

      case 'export_data':
        const { format = 'json', period = 'month' } = data || {};
        
        return NextResponse.json({
          success: true,
          message: 'Export request received',
          exportId: `export_${Date.now()}`,
          estimatedTime: '30 seconds',
          format: format,
          period: period
        });

      case 'clear_cache':
        return NextResponse.json({
          success: true,
          message: 'Dashboard cache cleared',
          clearedAt: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Dashboard POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process dashboard request' },
      { status: 500 }
    );
  }
}

// CSV生成ヘルパー関数
function generateCSV(data: any): string {
  const headers = ['Date', 'Messages', 'Sessions', 'English', 'Korean', 'Chinese', 'Japanese'];
  const rows = [headers.join(',')];

  // 簡略化されたCSV生成
  if (data.today) {
    const today = new Date().toISOString().split('T')[0];
    const row = [
      today,
      data.today.messageCount,
      data.today.sessionCount,
      data.today.languageBreakdown?.en || 0,
      data.today.languageBreakdown?.ko || 0,
      data.today.languageBreakdown?.zh || 0,
      data.today.languageBreakdown?.ja || 0
    ].join(',');
    rows.push(row);
  }

  return rows.join('\n');
}