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

    // 繝・ヵ繧ｩ繝ｫ繝域ｱｺ貂域焔谿ｵ縺檎┌縺・ｴ蜷医・繧ｨ繝ｩ繝ｼ
    const cust = await stripe.customers.retrieve(customerId);
    const pm = (cust as any)?.invoice_settings?.default_payment_method;
    if (!pm) {
      return NextResponse.json({ error: "鬘ｧ螳｢縺ｫ謾ｯ謇墓婿豕輔′譛ｪ險ｭ螳壹〒縺吶・ustomer Portal縺ｧ繧ｫ繝ｼ繝峨ｒ逋ｻ骭ｲ縺励※縺上□縺輔＞縲・ }, { status: 400 });
    }

    // 隲区ｱよ嶌繧剃ｽ懈・縺励※蜊ｳ譎りｪｲ驥・    await stripe.invoiceItems.create({
      customer: customerId,
      currency: "jpy",
      amount, // ﾂ･1,000 譌｢螳夲ｼ育腸蠅・､画焚縺ｧ荳頑嶌縺榊庄・・      description: reason,
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