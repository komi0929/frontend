import { NextRequest, NextResponse } from 'next/server';

// Stripe統合API - PRD v2.1準拠
export const maxDuration = 10; // Vercel関数タイムアウト対策

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'create_checkout_session':
        return handleCreateCheckoutSession(data);
      
      case 'create_customer_portal':
        return handleCreateCustomerPortal(data);
      
      case 'get_subscription_status':
        return handleGetSubscriptionStatus(data);
      
      case 'cancel_subscription':
        return handleCancelSubscription(data);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Stripe API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Checkout Session作成
async function handleCreateCheckoutSession(data: any) {
  const { priceId, userId, successUrl, cancelUrl } = data;

  // モック実装 - 実際の環境では Stripe.checkout.sessions.create() を使用
  const mockCheckoutSession = {
    id: `cs_${Date.now()}`,
    url: `https://checkout.stripe.com/pay/cs_${Date.now()}#fidkdWxOYHwnPyd1blppbHNgWjA0U1JfNDVXRGE1fElqVnBMXzNNREF2UEJ3T0l1UFR9M2JNPFJGUzJydkBBZ2xXNDcyN3x8QFJdPUkxN2lgc3JJT0JvSjNPNlc0NEl9fzRvZ0NEZWRCR19gZ1RxdGxDSUtTTGAnaGlhbGsjZkcnKSB3c2RZJkdaWE4wTnJkJ2B3YGFnF20wbV9NY3Y0NG9GNGMwN0s2NlFzPGZxQnJxZGNyNkF2YEZxNkcwcjJ2Uj1ManclcCdxKSdmaWNxa2lgZXdmJyknaGh3M3FSJzdoamRiaD03MDxoZzRuNDwwNGBhNz02M2hgN3NjMkwncWhnNGlrKyclUnY1YDdgJyk`,
    customer: `cus_mock_${userId}`,
    payment_intent: `pi_mock_${Date.now()}`,
    amount_total: 99000, // 990円
    currency: 'jpy',
    status: 'open'
  };

  return NextResponse.json({
    success: true,
    checkout_session: mockCheckoutSession,
    message: 'Checkout session created (mock)',
    note: '本番環境では実際のStripe APIを使用'
  });
}

// Customer Portal作成
async function handleCreateCustomerPortal(data: any) {
  const { customerId, returnUrl } = data;

  const mockPortalSession = {
    id: `bps_${Date.now()}`,
    url: `https://billing.stripe.com/p/session/bps_${Date.now()}`,
    customer: customerId,
    return_url: returnUrl || 'https://app.example.com/dashboard'
  };

  return NextResponse.json({
    success: true,
    portal_session: mockPortalSession,
    message: 'Customer portal created (mock)'
  });
}

// サブスクリプション状態取得
async function handleGetSubscriptionStatus(data: any) {
  const { customerId, userId } = data;

  const mockSubscription = {
    id: `sub_${Date.now()}`,
    customer: customerId,
    status: 'active', // active, trialing, past_due, canceled
    current_period_start: Math.floor(Date.now() / 1000),
    current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000), // 30日後
    trial_end: data.trialActive ? Math.floor((Date.now() + 14 * 24 * 60 * 60 * 1000) / 1000) : null,
    items: {
      data: [{
        price: {
          id: 'price_1234567890',
          nickname: 'あんしんディスプレイ Pro プラン',
          unit_amount: 99000, // 990円
          currency: 'jpy',
          recurring: {
            interval: 'month'
          }
        },
        quantity: 1
      }]
    },
    latest_invoice: {
      amount_paid: 99000,
      payment_intent: {
        status: 'succeeded'
      }
    },
    metadata: {
      user_id: userId,
      plan_name: 'pro'
    }
  };

  return NextResponse.json({
    success: true,
    subscription: mockSubscription,
    billing_info: {
      next_payment: new Date(mockSubscription.current_period_end * 1000).toISOString(),
      amount: '¥990',
      status: 'active',
      payment_method: '**** **** **** 1234'
    }
  });
}

// サブスクリプションキャンセル
async function handleCancelSubscription(data: any) {
  const { subscriptionId, cancelAtPeriodEnd = true } = data;

  const mockCanceledSubscription = {
    id: subscriptionId,
    status: cancelAtPeriodEnd ? 'active' : 'canceled',
    cancel_at_period_end: cancelAtPeriodEnd,
    canceled_at: cancelAtPeriodEnd ? null : Math.floor(Date.now() / 1000),
    current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000)
  };

  return NextResponse.json({
    success: true,
    subscription: mockCanceledSubscription,
    message: cancelAtPeriodEnd 
      ? 'サブスクリプションは現在の請求期間の終了時にキャンセルされます'
      : 'サブスクリプションは即座にキャンセルされました'
  });
}

// GET - サブスクリプション情報取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId') || 'mock_customer';

    return NextResponse.json({
      success: true,
      customer_id: customerId,
      subscriptions: [
        {
          id: 'sub_mock_123',
          status: 'active',
          current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
          plan: 'あんしんディスプレイ Pro',
          amount: 99000
        }
      ]
    });

  } catch (error) {
    console.error('Stripe GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve subscription data' },
      { status: 500 }
    );
  }
}

// Webhook処理（別途実装）
export async function PUT(request: NextRequest) {
  try {
    // Stripeからのwebhook処理
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    // 実装時はStripe.webhooks.constructEvent()でイベント検証

    const mockEvent = {
      id: `evt_${Date.now()}`,
      type: 'invoice.payment_succeeded',
      data: {
        object: {
          id: `in_${Date.now()}`,
          customer: 'cus_mock_customer',
          amount_paid: 99000,
          status: 'paid'
        }
      }
    };

    // イベントタイプに応じた処理
    switch (mockEvent.type) {
      case 'invoice.payment_succeeded':
        console.log('Payment succeeded:', mockEvent.data.object);
        break;
      case 'invoice.payment_failed':
        console.log('Payment failed:', mockEvent.data.object);
        break;
      case 'customer.subscription.deleted':
        console.log('Subscription deleted:', mockEvent.data.object);
        break;
    }

    return NextResponse.json({
      success: true,
      event: mockEvent.type,
      message: 'Webhook processed (mock)'
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}