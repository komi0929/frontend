import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { sendEmail } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    // 開発時の無効化用
    return NextResponse.json({ warning: "STRIPE_WEBHOOK_SECRET not set; webhook disabled" }, { status: 200 });
  }
  const stripe = getStripe();
  const sig = req.headers.get("stripe-signature") || "";
  const raw = await req.text();
  let event: any;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err: any) {
    return NextResponse.json({ error: `invalid signature: ${err?.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        let email: string | null = session.customer_details?.email || session.customer_email || null;
        if (!email && session.customer) {
          const cust = await stripe.customers.retrieve(session.customer as string);
          email = (cust as any)?.email || email;
        }
        if (email) {
          await sendEmail(email, "ご登録ありがとうございます（決済完了）",
            `<p>ご利用ありがとうございます。サブスクリプションが開始されました。</p>`);
        }
        break;
      }
      case "invoice.payment_failed": {
        const inv = event.data.object as any;
        let email: string | null = inv.customer_email || null;
        if (!email && inv.customer) {
          const cust = await stripe.customers.retrieve(inv.customer as string);
          email = (cust as any)?.email || email;
        }
        if (email) {
          await sendEmail(email, "お支払いに失敗しました",
            `<p>お支払いに失敗しました。お手数ですが<a href='/admin/subscription'>お支払い方法の更新</a>をお願いします。</p>`);
        }
        break;
      }
      case "invoice.payment_succeeded":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      default:
        // 必須処理なし（必要に応じて拡張）
        break;
    }
    return NextResponse.json({ received: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "webhook_handler_error" }, { status: 500 });
  }
}