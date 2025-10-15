import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET || "";

  try {
    const raw = await req.text();
    const event = secret && sig
      ? stripe.webhooks.constructEvent(raw, sig, secret)
      : (JSON.parse(raw) as any);

    switch (event.type) {
      case "checkout.session.completed":
        // TODO: 顧客作成やメタデータ反映など（PRDに合わせ拡張）
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        // TODO: ステータス同期など
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "webhook_error" }, { status: 400 });
  }
}