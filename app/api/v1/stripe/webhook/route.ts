import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe";
import { sendMail } from "@/lib/mail";
import * as Sentry from "@sentry/nextjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function notifySlack(msg:string){
  try {
    const url = process.env.SLACK_WEBHOOK_URL;
    if (url) await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:msg})});
  } catch {}
}

export async function POST(req: Request) {
  const signature = headers().get("stripe-signature")!;
  const stripe = getStripe()();
  const secret = process.env.STRIPE_WEBHOOK_SECRET!;
  try {
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(body, signature, secret);

    if (event.type === "checkout.session.completed") {
      await notifySlack("checkout.session.completed");
      try {
        const session = await stripe.checkout.sessions.retrieve((event.data.object as any).id, { expand: ["customer"] });
        const email =
          (session.customer_details && (session.customer_details as any).email) ||
          ((session.customer as any)?.email);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        if (email) {
          await sendMail(
            email,
            "縲舌≠繧薙＠繧薙ョ繧｣繧ｹ繝励Ξ繧､縲代♀逕ｳ縺苓ｾｼ縺ｿ縺ゅｊ縺後→縺・＃縺悶＞縺ｾ縺・,
            `<p>縺薙・蠎ｦ縺ｯ縺顔筏縺苓ｾｼ縺ｿ縺ゅｊ縺後→縺・＃縺悶＞縺ｾ縺吶・/p>
             <p>繝槭う繧ｯ蛻ｰ逹蠕・<b>14譌･髢・/b> 縺ｯ辟｡譁吶〒縺願ｩｦ縺励＞縺溘□縺代∪縺吶・/p>
             <p>縺碑ｫ区ｱよュ蝣ｱ縺ｮ遒ｺ隱阪ｄ縺頑髪謇輔＞譁ｹ豕輔・譖ｴ譁ｰ縺ｯ縲√い繝励Μ蜀・後し繝悶せ繧ｯ繝ｪ繝励す繝ｧ繝ｳ邂｡逅・阪°繧峨＞縺､縺ｧ繧ょ庄閭ｽ縺ｧ縺吶・/p>
             <p><a href="${appUrl}/admin/subscription">繧ｵ繝悶せ繧ｯ繝ｪ繝励す繝ｧ繝ｳ邂｡逅・ｒ髢九￥</a></p>`
          );
        }
      } catch (e:any) {
        console.warn("signup mail failed:", e?.message);
        Sentry.captureException(e);
      }
    }

    if (event.type === "invoice.payment_failed") {
      await notifySlack("invoice.payment_failed");
    }

    return new NextResponse("ok",{status:200});
  } catch (e:any) {
    console.error("webhook error:", e?.message);
    Sentry.captureException(e);
    await notifySlack("webhook error: "+e?.message);
    return new NextResponse("invalid",{status:400});
  }
}