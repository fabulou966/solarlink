import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  debug: process.env.NODE_ENV === "development",
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  beforeSend(event, hint) {
    if (event.exception) {
      const error = hint.originalException;
      if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
        return null;
      }
    }
    return event;
  },
});