import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripeClient } from "@/lib/stripe";
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
  const stripe = stripeClient();
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
            "【あんしんディスプレイ】お申し込みありがとうございます",
            `<p>この度はお申し込みありがとうございます。</p>
             <p>マイク到着後 <b>14日間</b> は無料でお試しいただけます。</p>
             <p>ご請求情報の確認やお支払い方法の更新は、アプリ内「サブスクリプション管理」からいつでも可能です。</p>
             <p><a href="${appUrl}/admin/subscription">サブスクリプション管理を開く</a></p>`
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