import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request){
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  try {
    if(!id) throw new Error("session id missing");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });
    const s = await stripe.checkout.sessions.retrieve(id);
    return NextResponse.json({ customer: s.customer, subscription: s.subscription });
  } catch(e:any) {
    return NextResponse.json({ error: e?.message || "session_error" }, { status: 400 });
  }
}