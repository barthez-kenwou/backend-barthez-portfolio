import { config } from '@/app/config';
import { AppError } from '@/shared/domain/errors/app-error';
import log from '@/shared/infrastructure/logging/logger';

export type PlausiblePeriod = 'day' | '7d' | '30d' | 'month' | '6mo' | '12mo';

type AggregateMetric = {
  value: number;
  change?: number | null;
};

type AggregateResponse = {
  results: Record<string, AggregateMetric>;
};

type BreakdownRow = Record<string, string | number | null>;

type BreakdownResponse = {
  results: BreakdownRow[];
};

const DEFAULT_PERIOD: PlausiblePeriod = '7d';

// Strip quotes / accidental "Bearer " paste from .env
function normalizeApiKey(raw: string): string {
  return raw
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/^Bearer\s+/i, '')
    .trim();
}

function assertConfigured(): { baseUrl: string; siteId: string; apiKey: string } {
  const { baseUrl, siteId, apiKey: rawKey } = config.observability.plausible;
  const apiKey = normalizeApiKey(rawKey);
  if (!apiKey) {
    throw AppError.serviceUnavailable('Plausible API key is not configured (PLAUSIBLE_API_KEY)');
  }
  return { baseUrl, siteId: siteId.trim(), apiKey };
}

async function plausibleGet<T>(
  path: string,
  query: Record<string, string | number | undefined>,
): Promise<T> {
  const { baseUrl, siteId, apiKey } = assertConfigured();
  const params = new URLSearchParams();
  params.set('site_id', siteId);
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === '') continue;
    params.set(key, String(value));
  }

  const url = `${baseUrl}${path}?${params.toString()}`;
  const started = Date.now();

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(12_000),
    });
  } catch (error) {
    log.error('Plausible Stats API network error', {
      path,
      error: error instanceof Error ? error.message : String(error),
    });
    // Prefer 503 over 502: Cloudflare often replaces origin 502 bodies with
    // "error code: 502", which hides the real message in the CMS.
    throw AppError.serviceUnavailable('Plausible Stats API unreachable');
  }

  const bodyText = await response.text();
  let body: unknown = null;
  try {
    body = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    body = { raw: bodyText.slice(0, 300) };
  }

  if (!response.ok) {
    log.warn('Plausible Stats API error', {
      path,
      status: response.status,
      elapsedMs: Date.now() - started,
      siteId,
      body,
    });
    if (response.status === 401 || response.status === 403) {
      const detail =
        body &&
        typeof body === 'object' &&
        'error' in body &&
        typeof (body as { error: unknown }).error === 'string'
          ? (body as { error: string }).error
          : 'Invalid API key or site_id';
      throw AppError.serviceUnavailable(
        `Plausible rejected credentials for site_id=${siteId}: ${detail}`,
      );
    }
    throw AppError.serviceUnavailable(`Plausible Stats API returned ${response.status}`);
  }

  return body as T;
}

function metricValue(results: Record<string, AggregateMetric>, key: string): number {
  const row = results[key];
  if (!row || typeof row.value !== 'number' || Number.isNaN(row.value)) return 0;
  return row.value;
}

export async function fetchAggregate(period: PlausiblePeriod = DEFAULT_PERIOD) {
  const data = await plausibleGet<AggregateResponse>('/api/v1/stats/aggregate', {
    period,
    metrics: 'visitors,pageviews,bounce_rate,visit_duration,visits',
  });
  const results = data.results ?? {};
  return {
    period,
    visitors: metricValue(results, 'visitors'),
    pageviews: metricValue(results, 'pageviews'),
    visits: metricValue(results, 'visits'),
    bounceRate: metricValue(results, 'bounce_rate'),
    visitDuration: metricValue(results, 'visit_duration'),
  };
}

export async function fetchBreakdown(
  property: string,
  period: PlausiblePeriod = DEFAULT_PERIOD,
  limit = 10,
  metrics = 'visitors,pageviews',
) {
  const data = await plausibleGet<BreakdownResponse>('/api/v1/stats/breakdown', {
    period,
    property,
    metrics,
    limit,
  });
  return data.results ?? [];
}

export async function fetchTopPages(period: PlausiblePeriod = DEFAULT_PERIOD, limit = 10) {
  const rows = await fetchBreakdown('event:page', period, limit, 'visitors,pageviews');
  return rows.map((row) => ({
    path: String(row.page ?? ''),
    visitors: Number(row.visitors ?? 0),
    pageviews: Number(row.pageviews ?? 0),
  }));
}

export async function fetchTopSources(period: PlausiblePeriod = DEFAULT_PERIOD, limit = 5) {
  const rows = await fetchBreakdown('visit:source', period, limit, 'visitors');
  return rows.map((row) => ({
    source: String(row.source ?? 'Direct'),
    visitors: Number(row.visitors ?? 0),
  }));
}

/** Filter page breakdown by path prefix (client-side — Stats API filters are limited on CE). */
export async function fetchTopPagesByPrefix(
  prefix: string,
  period: PlausiblePeriod = DEFAULT_PERIOD,
  limit = 5,
) {
  const pages = await fetchTopPages(period, 50);
  return pages
    .filter((row) => row.path === prefix || row.path.startsWith(`${prefix}/`))
    .slice(0, limit);
}

export async function fetchCustomEvents(period: PlausiblePeriod = DEFAULT_PERIOD, limit = 20) {
  const rows = await fetchBreakdown('event:name', period, limit, 'visitors');
  return rows
    .map((row) => ({
      name: String(row.name ?? ''),
      visitors: Number(row.visitors ?? 0),
    }))
    .filter((row) => row.name && row.name !== 'pageview');
}

export function parsePeriod(raw: unknown): PlausiblePeriod {
  const value = String(raw || DEFAULT_PERIOD);
  const allowed: PlausiblePeriod[] = ['day', '7d', '30d', 'month', '6mo', '12mo'];
  return (allowed.includes(value as PlausiblePeriod) ? value : DEFAULT_PERIOD) as PlausiblePeriod;
}
