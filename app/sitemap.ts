import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const urls = [
    "/", "/display", "/display/live",
    "/admin/subscription", "/admin/shipments",
    "/supplier", "/terms", "/privacy", "/legal"
  ];
  return urls.map((p)=>({ url: base.replace(/\/$/,"") + p }));
}