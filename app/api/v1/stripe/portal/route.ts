import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const stripe = getStripe();
    const body = await req.json().catch(() => ({} as any));
    let customer: string | null = (body?.customerId as string) || null;
    const email: string | null = (body?.email as string) || null;
    const origin = process.env.NEXT_PUBLIC_SITE_ORIGIN || "";
    const returnUrl: string = body?.returnUrl || (origin ? `${origin}/admin/subscription` : "/admin/subscription");

    if (!customer && email) {
      const found = await stripe.customers.list({ email, limit: 1 });
      customer = found.data?.[0]?.id || null;
    }
    if (!customer) {
      customer = process.env.STRIPE_TEST_CUSTOMER_ID || "";
    }
    if (!customer) {
      return NextResponse.json({ error: "customerId or email is required" }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({ customer, return_url: returnUrl });
    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "portal_failed" }, { status: 500 });
  }
}