import { withSentryConfig } from "@sentry/nextjs";

/** Security headers (CSP等) */
const securityHeaders = () => {
  const csp = [
    "default-src '\''self'\''",
    "script-src '\''self'\'' '\''unsafe-inline'\'' https://js.stripe.com",
    "style-src '\''self'\'' '\''unsafe-inline'\''",
    "img-src '\''self'\'' data:",
    "connect-src '\''self'\'' https://api.deepl.com https://api-free.deepl.com https://translation.googleapis.com https://api.openai.com https://hooks.stripe.com https://api.stripe.com",
    "frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
    "base-uri '\''self'\''",
    "form-action '\''self'\'' https://checkout.stripe.com"
  ].join("; ");

  return [
    { key: "Content-Security-Policy", value: csp },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(self)" },
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }
  ];
};

/** @type {import("next").NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders() }];
  },
  productionBrowserSourceMaps: false,
};

export default withSentryConfig(
  nextConfig,
  { silent: true },           // build時のSentryログを抑制
  { hideSourceMaps: true }    // 公開ビルドでソースマップ非公開
);