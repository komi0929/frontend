import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { sendEmail } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    // 髢狗匱譎ゅ・辟｡蜉ｹ蛹也畑
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
          await sendEmail(email, "縺皮匳骭ｲ縺ゅｊ縺後→縺・＃縺悶＞縺ｾ縺呻ｼ域ｱｺ貂亥ｮ御ｺ・ｼ・,
            `<p>縺泌茜逕ｨ縺ゅｊ縺後→縺・＃縺悶＞縺ｾ縺吶ゅし繝悶せ繧ｯ繝ｪ繝励す繝ｧ繝ｳ縺碁幕蟋九＆繧後∪縺励◆縲・/p>`);
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
          await sendEmail(email, "縺頑髪謇輔＞縺ｫ螟ｱ謨励＠縺ｾ縺励◆",
            `<p>縺頑髪謇輔＞縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲ゅ♀謇区焚縺ｧ縺吶′<a href='/admin/subscription'>縺頑髪謇輔＞譁ｹ豕輔・譖ｴ譁ｰ</a>繧偵♀鬘倥＞縺励∪縺吶・/p>`);
        }
        break;
      }
      case "invoice.payment_succeeded":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      default:
        // 蠢・亥・逅・↑縺暦ｼ亥ｿ・ｦ√↓蠢懊§縺ｦ諡｡蠑ｵ・・        break;
    }
    return NextResponse.json({ received: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "webhook_handler_error" }, { status: 500 });
  }
}