import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function detectLiveKey(sk: string){
  return sk?.startsWith("sk_live_");
}

export async function POST(req: Request) {
  try {
    const sk = process.env.STRIPE_SECRET_KEY!;
    const stripe = new Stripe(sk, { apiVersion: "2024-06-20" });
    const { need_mic=true, policy_mic_return_ack=true, trial_period_days=7 } = await req.json().catch(()=>({}));

    // 価格IDの live/test ミスマッチを事前検知
    const priceId = process.env.STRIPE_PRICE_ID!;
    const price = await stripe.prices.retrieve(priceId);
    const keyLive = detectLiveKey(sk);
    if (price.livemode !== keyLive) {
      return NextResponse.json({
        error: `Stripe設定エラー: 使用中のキー(${keyLive ? "live" : "test"})と価格ID(${price.livemode ? "live" : "test"})のモードが異なります。`,
        hint: "Stripeダッシュボードで同じモードのPrice IDを指定してください。"
      }, { status: 400 });
    }

    const success = new URL(process.env.STRIPE_SUCCESS_URL || "http://localhost:3000/success");
    success.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");
    const cancel = process.env.STRIPE_CANCEL_URL || "http://localhost:3000/cancel";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      payment_method_collection: "always",
      subscription_data: {
        trial_period_days,
        metadata: {
          plan: "anshin_display_monthly",
          need_mic: need_mic ? "1" : "0",
          policy_mic_return_ack: policy_mic_return_ack ? "1" : "0"
        }
      },
      success_url: success.toString(),
      cancel_url: cancel,
      allow_promotion_codes: true
    });

    return NextResponse.json({ url: session.url });
  } catch(e:any) {
    console.error("Stripe checkout error:", e);
    return NextResponse.json({ error: e?.message || "checkout_error" }, { status: 500 });
  }
}