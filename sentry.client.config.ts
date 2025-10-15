import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || undefined,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  environment: process.env.SENTRY_ENVIRONMENT || process.env.VERCEL_ENV || "development",
});