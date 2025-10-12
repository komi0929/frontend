import { NextRequest, NextResponse } from 'next/server';

// セッション管理API - PRD v2.1準拠
export const maxDuration = 10; // Vercel関数タイムアウト対策

export async function POST(request: NextRequest) {
  try {
    // Content-Typeチェック
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => {
      throw new Error('Invalid JSON in request body');
    });
    const { action, sessionId, userId, selectedLanguage } = body;

    switch (action) {
      case 'create':
        // 新しいセッション作成
        const newSession = {
          id: `session_${Date.now()}_${Math.random().toString(36).substring(2)}`,
          userId: userId || 'guest_user',
          selectedLanguage: selectedLanguage,
          startedAt: new Date().toISOString(),
          messageCount: 0,
          status: 'active'
        };

        return NextResponse.json({
          success: true,
          session: newSession,
          message: 'Session created successfully'
        });

      case 'end':
        // セッション終了
        if (!sessionId) {
          return NextResponse.json(
            { error: 'Session ID is required' },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          sessionId: sessionId,
          endedAt: new Date().toISOString(),
          message: 'Session ended successfully'
        });

      case 'extend':
        // セッション延長
        if (!sessionId) {
          return NextResponse.json(
            { error: 'Session ID is required' },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          sessionId: sessionId,
          extendedAt: new Date().toISOString(),
          newExpiry: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // +30分
          message: 'Session extended successfully'
        });

      case 'heartbeat':
        // セッションハートビート（活動記録）
        return NextResponse.json({
          success: true,
          sessionId: sessionId || 'unknown',
          lastActivity: new Date().toISOString(),
          status: 'active'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported: create, end, extend, heartbeat' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// セッション情報取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      // 全アクティブセッション一覧（管理用）
      return NextResponse.json({
        activeSessions: [
          {
            id: 'demo_session_1',
            userId: 'demo_user',
            selectedLanguage: 'en',
            startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            messageCount: 8,
            status: 'active'
          }
        ],
        totalActive: 1
      });
    }

    // 特定セッション情報
    return NextResponse.json({
      session: {
        id: sessionId,
        userId: 'demo_user',
        selectedLanguage: 'en',
        startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        messageCount: 8,
        status: 'active',
        lastActivity: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Session GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve session data' },
      { status: 500 }
    );
  }
}