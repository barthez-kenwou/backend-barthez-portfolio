/**
 * Logging and observability settings (Winston, Loki, optional tracing).
 * OpenTelemetry SDK is not a boot-time dependency — enable later via OTEL_ENABLED
 * and a process wrapper. We always parse W3C `traceparent` into request context.
 *
 * Plausible CE Stats API powers the admin CMS audience panel (server-side only).
 */
import { fromEnv } from '../env';

export const observabilityConfig = {
  logLevel: fromEnv.get('LOG_LEVEL').default('info').asString(),
  logToFile: fromEnv.get('LOG_TO_FILE').default('false').asBool(),
  lokiEnabled: fromEnv.get('LOKI_ENABLED').default('false').asBool(),
  lokiHost: fromEnv.get('LOKI_HOST').default('http://loki:3100').asString(),
  /**
   * Reserved flag: when true, an optional OTEL exporter may be started by ops.
   */
  otelEnabled: fromEnv.get('OTEL_ENABLED').default('false').asBool(),
  plausible: {
    baseUrl: fromEnv
      .get('PLAUSIBLE_BASE_URL')
      .default('https://analytics.zenora360.com')
      .asString()
      .replace(/\/$/, ''),
    siteId: fromEnv.get('PLAUSIBLE_SITE_ID').default('barthez-kenwou.dev').asString(),
    apiKey: fromEnv.get('PLAUSIBLE_API_KEY').default('').asString(),
    /** Public UI for operators (CMS “open Plausible” link). */
    publicUrl: fromEnv
      .get('PLAUSIBLE_PUBLIC_URL')
      .default('https://analytics.zenora360.com/barthez-kenwou.dev')
      .asString(),
  },
} as const;

export type ObservabilityConfig = typeof observabilityConfig;
