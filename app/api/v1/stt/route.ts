import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type SttBody = { audioBase64?: string; mime?: string; langHint?: string; };

const MAX_BYTES = 25 * 1024 * 1024; // 25MB

function inferExt(mime?: string): string {
  if (!mime) return "dat";
  const m = mime.toLowerCase();
  if (m.includes("webm")) return "webm";
  if (m.includes("mpeg") || m.includes("mp3")) return "mp3";
  if (m.includes("wav")) return "wav";
  if (m.includes("ogg")) return "ogg";
  if (m.includes("m4a")) return "m4a";
  return "dat";
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
function norm(lang?: string | null) { return (lang || "EN").toUpperCase(); }

export async function POST(req: Request) {
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) return NextResponse.json({ error: "OPENAI_API_KEY is not set" }, { status: 500 });

    const body = (await req.json()) as SttBody;
    const audioBase64 = body?.audioBase64;
    if (!audioBase64 || typeof audioBase64 !== "string" || audioBase64.length < 8) {
      return NextResponse.json({ error: "audioBase64 (base64) is required" }, { status: 400 });
    }
    const mime = body?.mime && typeof body.mime === "string" ? body.mime : "audio/webm";
    const cookieLang = getCookie(req, "anshin_target_lang");
    const langHint = norm(body?.langHint || cookieLang || "EN");

    const buf = Buffer.from(audioBase64, "base64");
    if (buf.byteLength > MAX_BYTES) return NextResponse.json({ error: "Audio too large (>25MB)" }, { status: 413 });

    const ext = inferExt(mime);
    const blob = new Blob([buf], { type: mime });
    const form = new FormData();
    form.append("file", blob, `audio.${ext}`);
    form.append("model", "whisper-1");
    form.append("response_format", "json");
    if (langHint) form.append("language", langHint);

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json({ error: json?.error?.message || "STT failed", raw: json }, { status: 502 });
    }

    const text = (json?.text ?? "").toString();
    return NextResponse.json({ text });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "stt_unexpected" }, { status: 500 });
  }
}