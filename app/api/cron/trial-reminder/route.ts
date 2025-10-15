import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { sendEmail } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function daysFromNow(n: number) { return Date.now() + n * 24 * 60 * 60 * 1000; }

export async function GET(req: Request) {
  const token = process.env.CRON_AUTH_TOKEN || "";
  const auth = req.headers.get("authorization") || "";
  if (token && auth !== `Bearer ${token}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const stripe = getStripe();

  const now = Math.floor(Date.now() / 1000);
  const in3d = Math.floor(daysFromNow(3) / 1000);

  let starting_after: string | undefined = undefined;
  let notified = 0;
  let inspected = 0;

  while (true) {
    const page: Stripe.Response<Stripe.ApiList<Stripe.Subscription>> = await stripe.subscriptions.list({
      status: "trialing",
      limit: 100,
      ...(starting_after ? { starting_after } : {}),
    });

    for (const sub of page.data) {
      inspected++;
      const te = sub.trial_end || 0;
      if (te >= now && te <= in3d) {
        let email: string | null = null;
        if (typeof sub.customer === "string") {
          const cust = await stripe.customers.retrieve(sub.customer);
          email = (cust as any)?.email || null;
        }
        if (email) {
          await sendEmail(
            email,
            "繝医Λ繧､繧｢繝ｫ譛滄俣縺ｮ邨ゆｺ・′霑代▼縺・※縺・∪縺・,
            `<p>縺泌茜逕ｨ縺ゅｊ縺後→縺・＃縺悶＞縺ｾ縺吶ゅヨ繝ｩ繧､繧｢繝ｫ縺ｯ <strong>${new Date(te * 1000).toLocaleString()}</strong> 縺ｫ邨ゆｺ・ｺ亥ｮ壹〒縺吶らｶ咏ｶ壹ｒ縺泌ｸ梧悍縺ｮ蝣ｴ蜷医・縺頑焔邯壹″荳崎ｦ√〒縺吶・/p>`
          );
          notified++;
        }
      }
    }
    if (!page.has_more) break;
    starting_after = page.data[page.data.length - 1].id;
  }

  return NextResponse.json({ inspected, notified });
}