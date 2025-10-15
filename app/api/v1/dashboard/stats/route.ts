import { NextResponse } from "next/server";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function GET(){ return NextResponse.json({ users:42, active:39, langs:{ en:20, ko:10, zh:9 } }); }