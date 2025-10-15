import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Body = {
  subscriptionId?: string;
  shippedAt?: string;
  expectedArrivalDate?: string;
  deliveredAt?: string;
  trialDays?: number;
};

function parseDate(s?: string | null): Date | null {
  if (!s || typeof s !== "string") return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}
function addDays(base: Date, n: number): Date {
  const d = new Date(base.getTime());
  d.setDate(d.getDate() + n);
  return d;
}

export async function POST(req: Request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: "STRIPE_SECRET_KEY is not set" }, { status: 500 });
    }

    const body = (await req.json()) as Body;
    const { subscriptionId, shippedAt, expectedArrivalDate, deliveredAt } = body || {};
    if (!subscriptionId) {
      return NextResponse.json({ error: "subscriptionId is required" }, { status: 400 });
    }

    // Trial days policy: env overrideable (default 7)
    const ENV_DAYS = Number(process.env.SUBSCRIPTION_TRIAL_DAYS || 7);
    const reqDays = typeof body?.trialDays === "number" && body.trialDays > 0 ? Math.floor(body.trialDays) : NaN;
    const days = Number.isFinite(reqDays) ? (reqDays as number) : ENV_DAYS;

    // Anchor date preference: deliveredAt > expectedArrivalDate > shippedAt > now
    const delivered = parseDate(deliveredAt);
    const expected = parseDate(expectedArrivalDate);
    const shipped = parseDate(shippedAt);
    const anchor = delivered || expected || shipped || new Date();

    // Compute trial_end
    let trialEndDate = addDays(anchor, days);
    const now = new Date();
    // Avoid past/near-past timestamps (Stripe requires future)
    if (trialEndDate.getTime() <= now.getTime() + 60_000) {
      trialEndDate = addDays(now, days);
    }
    const trialEndUnix = Math.floor(trialEndDate.getTime() / 1000);

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });
    const updated = await stripe.subscriptions.update(subscriptionId, {
      trial_end: trialEndUnix,
      proration_behavior: "none",
      metadata: {
        shipped_at: shippedAt || "",
        expected_arrival_date: expectedArrivalDate || "",
        delivered_at: deliveredAt || "",
        trial_end_source: "shipment_update_api",
      },
    });

    return NextResponse.json({
      subscriptionId,
      trial_end_unix: trialEndUnix,
      trial_end_iso: new Date(trialEndUnix * 1000).toISOString(),
      status: updated.status,
    });
  } catch (err: any) {
    const code = err?.statusCode || err?.raw?.statusCode || 500;
    const requestId = err?.requestId || err?.raw?.requestId;
    return NextResponse.json(
      { error: err?.message || "shipment_update_failed", requestId },
      { status: code },
    );
  }
}