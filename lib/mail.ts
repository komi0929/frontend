import { Resend } from "resend";

export async function sendMail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "Anshin Display <onboarding@resend.dev>";
  if (!key) {
    console.warn("RESEND_API_KEY missing, skip email:", subject);
    return { skipped: true };
  }
  const resend = new Resend(key);
  try {
    const { data, error } = await resend.emails.send({ from, to, subject, html });
    if (error) throw error;
    return { id: data?.id };
  } catch (e:any) {
    console.error("Resend error:", e?.message || e);
    return { error: e?.message || "resend_error" };
  }
}