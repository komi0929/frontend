import { NextResponse } from "next/server";
import { stripeClient } from "@/lib/stripe";
import { sendMail } from "@/lib/mail";
import * as Sentry from "@sentry/nextjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stripe = stripeClient();
    const now = Math.floor(Date.now()/1000);
    const three = 3*24*60*60;

    let starting_after: string|undefined = undefined;
    let sent = 0;

    do {
      const list = await stripe.subscriptions.list({ status:"trialing", limit:100, starting_after });
      for (const sub of list.data) {
        const te = (sub as any).trial_end as number|undefined;
        if (!te) continue;
        const left = te - now;
        const meta = (sub.metadata || {}) as Record<string,string>;
        if (left <= three && left > (2*24*60*60) && meta.notice3d !== "1") {
          let email: string|undefined;
          try {
            if (typeof sub.customer === "string") {
              const c = await stripe.customers.retrieve(sub.customer);
              email = (c as any)?.email;
            } else {
              email = (sub.customer as any)?.email;
            }
          } catch {}
          if (email) {
            const endDate = new Date(te*1000).toLocaleDateString("ja-JP");
            await sendMail(
              email,
              "【あと3日でご請求】無料期間が終了します",
              `<p>無料期間は <b>${endDate}</b> に終了します。</p>
               <p>継続しない場合は期日までにキャンセルをご検討ください。</p>`
            );
            await stripe.subscriptions.update(sub.id, { metadata: { ...meta, notice3d:"1" } });
            sent++;
          }
        }
      }
      starting_after = list.has_more ? list.data[list.data.length-1]?.id : undefined;
    } while (starting_after);

    return NextResponse.json({ ok:true, sent });
  } catch(e:any) {
    console.error("cron error:", e?.message);
    Sentry.captureException(e);
    return NextResponse.json({ error:e?.message||"cron_error" }, { status: 500 });
  }
}