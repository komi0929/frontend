import { NextResponse } from "next/server";
import { getStripe, isLiveMode, siteOrigin } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Body = { mode?: "checkout" | "portal" };

export async function POST(req: Request) {
  try {
    const stripe = getStripe();
    const body = (await req.json().catch(() => ({}))) as Body;
    const mode = body?.mode || "checkout";
    const origin = siteOrigin();
    const successUrl = `${origin}/success`;
    const cancelUrl = `${origin}/cancel`;

    if (mode === "portal") {
      // 顧客ポータルは既存の Customer ID が必要
      const customerId =
        process.env.STRIPE_CUSTOMER_ID_FOR_PORTAL || "";
      if (!customerId) {
        return NextResponse.json(
          { error: "顧客ポータルを開くには Customer ID が必要です。STRIPE_CUSTOMER_ID_FOR_PORTAL を設定してください。" },
          { status: 400 }
        );
      }
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: origin,
      });
      return NextResponse.json({ url: session.url });
    }

    // CHECKOUT: サブスク（PRD既定：7日トライアル）
    const price = isLiveMode()
      ? process.env.STRIPE_LIVE_PRICE_ID
      : process.env.STRIPE_TEST_PRICE_ID;
    if (!price) {
      return NextResponse.json(
        { error: `価格IDが未設定です: ${isLiveMode() ? "STRIPE_LIVE_PRICE_ID" : "STRIPE_TEST_PRICE_ID"}` },
        { status: 500 }
      );
    }
    const trialDays = Number(process.env.SUBSCRIPTION_TRIAL_DAYS || 7);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      line_items: [{ price, quantity: 1 }],
      subscription_data: { trial_period_days: trialDays },
    });
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "checkout_failed" }, { status: 500 });
  }
}