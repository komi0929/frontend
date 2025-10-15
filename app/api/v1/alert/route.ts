import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const webhook = process.env.SLACK_WEBHOOK_URL;
    if(!webhook) throw new Error("SLACK_WEBHOOK_URL missing");
    await fetch(webhook,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:message})});
    return NextResponse.json({ok:true});
  } catch(e:any){
    return NextResponse.json({error:e.message},{status:500});
  }
}