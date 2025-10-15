import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { subscriptionId, reason = "device buyout (unreturned)" } = await req.json();
    if (!subscriptionId) throw new Error("subscriptionId required");
    const amount = Number(process.env.BUYOUT_AMOUNT_JPY || "1000");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    const customerId = typeof sub.customer === "string" ? sub.customer : (sub.customer as any).id;

    // デフォルト決済手段が無い場合はエラー
    const cust = await stripe.customers.retrieve(customerId);
    const pm = (cust as any)?.invoice_settings?.default_payment_method;
    if (!pm) {
      return NextResponse.json({ error: "顧客に支払方法が未設定です。Customer Portalでカードを登録してください。" }, { status: 400 });
    }

    // 請求書を作成して即時課金
    await stripe.invoiceItems.create({
      customer: customerId,
      currency: "jpy",
      amount, // ¥1,000 既定（環境変数で上書き可）
      description: reason,
    });
    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: "charge_automatically",
      auto_advance: true,
    });
    const finalized = await stripe.invoices.finalizeInvoice(invoice.id, { auto_advance: true });
    return NextResponse.json({ ok: true, invoice: finalized.id, amount });
  } catch(e:any) {
    console.error("buyout error:", e?.message);
    return NextResponse.json({ error: e?.message || "buyout_error" }, { status: 400 });
  }
}