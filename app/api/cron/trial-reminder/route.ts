import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { sendEmail } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function daysFromNow(n: number) {
  return Date.now() + n * 24 * 60 * 60 * 1000;
}

export async function GET(req: Request) {
  const stripe = getStripe();
  const now = Math.floor(Date.now() / 1000);
  const in3d = Math.floor(daysFromNow(3) / 1000);

  let starting_after: string | undefined;
  let notified = 0;

  while (true) {
    const page: Stripe.Response<Stripe.ApiList<Stripe.Subscription>> =
      await stripe.subscriptions.list({
        status: "trialing",
        limit: 100,
        ...(starting_after ? { starting_after } : {}),
      });

    for (const sub of page.data) {
      const te = sub.trial_end || 0;
      if (te >= now && te <= in3d) {
        const custId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
        if (custId) {
          const customer = await stripe.customers.retrieve(custId);
          const email = (customer as any)?.email || null;
          if (email) {
            await sendEmail(
              email,
              "トライアル終了のお知らせ",
              `<p>トライアル期間は <strong>${new Date(te * 1000).toLocaleString()}</strong> に終了予定です。</p>`
            );
            notified++;
          }
        }
      }
    }

    if (!page.has_more) break;
    starting_after = page.data[page.data.length - 1].id;
  }

  return NextResponse.json({ notified });
}