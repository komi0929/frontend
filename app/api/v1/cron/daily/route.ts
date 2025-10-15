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
              "縲舌≠縺ｨ3譌･縺ｧ縺碑ｫ区ｱゅ醍┌譁呎悄髢薙′邨ゆｺ・＠縺ｾ縺・,
              `<p>辟｡譁呎悄髢薙・ <b>${endDate}</b> 縺ｫ邨ゆｺ・＠縺ｾ縺吶・/p>
               <p>邯咏ｶ壹＠縺ｪ縺・ｴ蜷医・譛滓律縺ｾ縺ｧ縺ｫ繧ｭ繝｣繝ｳ繧ｻ繝ｫ繧偵＃讀懆ｨ弱￥縺縺輔＞縲・/p>`
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