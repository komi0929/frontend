import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Body = {
  text?: string;
  target?: string;
  source?: string | null;
};

function norm(lang?: string | null): string {
  if (!lang) return "EN";
  const u = lang.toUpperCase();
  if (u === "JP") return "JA";
  return u;
}

function getCookie(req: Request, key: string): string | null {
  const raw = req.headers.get("cookie") || "";
  const parts = raw.split(/;\s*/);
  for (const p of parts) {
    const [k, ...v] = p.split("=");
    if (k === key) return decodeURIComponent(v.join("="));
  }
  return null;
}

async function deeplTranslate(text: string, target: string, source?: string | null) {
  const key = process.env.DEEPL_API_KEY;
  if (!key) return { ok: false, reason: "DEEPL_API_KEY missing" };
  const params = new URLSearchParams();
  params.append("text", text);
  params.append("target_lang", norm(target));
  const s = source ? norm(source) : null;
  if (s) params.append("source_lang", s);

  const endpoints = [
    process.env.DEEPL_API_ENDPOINT || "https://api-free.deepl.com/v2/translate",
    "https://api.deepl.com/v2/translate",
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: "POST",
        headers: { "Authorization": `DeepL-Auth-Key ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
      const json: any = await res.json().catch(() => ({}));
      if (res.ok && json?.translations?.[0]?.text) {
        return { ok: true, text: json.translations[0].text };
      }
    } catch {}
  }
  return { ok: false, reason: "deepl_failed" };
}

async function googleTranslate(text: string, target: string, source?: string | null) {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!key) return { ok: false, reason: "GOOGLE_TRANSLATE_API_KEY missing" };
  const url = `https://translation.googleapis.com/language/translate/v2?key=${key}`;
  const body = { q: text, target: norm(target).toLowerCase(), format: "text" as const };
  if (source) (body as any).source = norm(source).toLowerCase();
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json: any = await res.json().catch(() => ({}));
  const t = json?.data?.translations?.[0]?.translatedText;
  if (res.ok && t) return { ok: true, text: t };
  return { ok: false, reason: "google_failed", raw: json };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Body;
    const text = (body?.text || "").toString();
    if (!text) return NextResponse.json({ error: "text is required" }, { status: 400 });

    // target蜆ｪ蜈磯・ｽ・ body.target > Cookie(anshin_target_lang) > EN
    const cookieLang = getCookie(req, "anshin_target_lang");
    const target = norm(body?.target || cookieLang || "EN");
    const source = body?.source ? norm(body.source) : null;

    const first = await deeplTranslate(text, target, source);
    if (first.ok) return NextResponse.json({ text: first.text, provider: "deepl" });

    const second = await googleTranslate(text, target, source);
    if (second.ok) return NextResponse.json({ text: second.text, provider: "google" });

    return NextResponse.json({ error: "translate_failed", details: { deepl: first, google: second } }, { status: 502 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "translate_unexpected" }, { status: 500 });
  }
}