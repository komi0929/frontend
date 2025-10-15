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

    // 萓｡譬ｼID縺ｮ live/test 繝溘せ繝槭ャ繝√ｒ莠句燕讀懃衍
    const priceId = process.env.STRIPE_PRICE_ID!;
    const price = await stripe.prices.retrieve(priceId);
    const keyLive = detectLiveKey(sk);
    if (price.livemode !== keyLive) {
      return NextResponse.json({
        error: `Stripe險ｭ螳壹お繝ｩ繝ｼ: 菴ｿ逕ｨ荳ｭ縺ｮ繧ｭ繝ｼ(${keyLive ? "live" : "test"})縺ｨ萓｡譬ｼID(${price.livemode ? "live" : "test"})縺ｮ繝｢繝ｼ繝峨′逡ｰ縺ｪ繧翫∪縺吶Ａ,
        hint: "Stripe繝繝・す繝･繝懊・繝峨〒蜷後§繝｢繝ｼ繝峨・Price ID繧呈欠螳壹＠縺ｦ縺上□縺輔＞縲・
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