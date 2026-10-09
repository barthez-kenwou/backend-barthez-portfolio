import type { Request, Response } from 'express';

import { config } from '@/app/config';
import { CacheTTL, cacheData } from '@/shared/infrastructure/cache';
import { asyncHandler, response } from '@/shared/utils/http/responses/helpers';

import {
  type PlausiblePeriod,
  fetchAggregate,
  fetchCustomEvents,
  fetchTopPages,
  fetchTopPagesByPrefix,
  fetchTopSources,
  parsePeriod,
} from '../../infrastructure/plausible/plausible-stats.client';

/**
 * Admin analytics — Plausible CE Stats API proxy (cached).
 * Mounted at `/api/v1/admin/analytics`.
 */
export function createAnalyticsController() {
  const overview = asyncHandler(async (req: Request, res: Response) => {
    const period = parsePeriod(req.query.period);
    const { apiKey, publicUrl, siteId } = config.observability.plausible;

    if (!apiKey.trim()) {
      return response.ok(
        req,
        res,
        {
          configured: false,
          publicUrl,
          siteId,
          period,
          visitors: 0,
          pageviews: 0,
          visits: 0,
          bounceRate: 0,
          visitDuration: 0,
          topPages: [],
          topSources: [],
          topBlogs: [],
          topProjects: [],
          events: [],
        },
        'Analytics overview (Plausible API key not configured)',
      );
    }

    const payload = await cacheData(
      `plausible:overview:${period}`,
      async () => {
        const [aggregate, topPages, topSources, topBlogs, topProjects, events] = await Promise.all([
          fetchAggregate(period),
          fetchTopPages(period, 8),
          fetchTopSources(period, 5),
          fetchTopPagesByPrefix('/blog', period, 5),
          fetchTopPagesByPrefix('/projects', period, 5),
          fetchCustomEvents(period, 15),
        ]);

        return {
          configured: true,
          publicUrl,
          siteId,
          period,
          visitors: aggregate.visitors,
          pageviews: aggregate.pageviews,
          visits: aggregate.visits,
          bounceRate: aggregate.bounceRate,
          visitDuration: aggregate.visitDuration,
          topPages,
          topSources,
          topBlogs: topBlogs.map((row) => ({
            path: row.path,
            slug: row.path.replace(/^\/blog\/?/, '') || row.path,
            views: row.pageviews,
            visitors: row.visitors,
          })),
          topProjects: topProjects.map((row) => ({
            path: row.path,
            slug: row.path.replace(/^\/projects\/?/, '') || row.path,
            views: row.pageviews,
            visitors: row.visitors,
          })),
          events,
        };
      },
      CacheTTL.SHORT,
    );

    return response.ok(req, res, payload, 'Analytics overview');
  });

  const status = asyncHandler(async (req: Request, res: Response) => {
    const { apiKey, siteId, publicUrl, baseUrl } = config.observability.plausible;
    return response.ok(
      req,
      res,
      {
        configured: Boolean(apiKey.trim()),
        siteId,
        publicUrl,
        baseUrl,
      },
      'Analytics status',
    );
  });

  const topPages = asyncHandler(async (req: Request, res: Response) => {
    const period = parsePeriod(req.query.period);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const payload = await cacheData(
      `plausible:top-pages:${period}:${limit}`,
      () => fetchTopPages(period, limit),
      CacheTTL.SHORT,
    );
    return response.ok(req, res, { period, items: payload }, 'Top pages');
  });

  const topEntries = asyncHandler(async (req: Request, res: Response) => {
    const period = parsePeriod(req.query.period);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 5));
    const prefix = String(req.query.prefix || '/blog');
    const safePrefix = prefix.startsWith('/') ? prefix : `/${prefix}`;
    const payload = await cacheData(
      `plausible:top-entries:${period}:${safePrefix}:${limit}`,
      () => fetchTopPagesByPrefix(safePrefix, period, limit),
      CacheTTL.SHORT,
    );
    return response.ok(
      req,
      res,
      {
        period,
        prefix: safePrefix,
        items: payload.map((row) => ({
          path: row.path,
          slug: row.path.replace(new RegExp(`^${safePrefix}/?`), '') || row.path,
          views: row.pageviews,
          visitors: row.visitors,
        })),
      },
      'Top entries',
    );
  });

  const events = asyncHandler(async (req: Request, res: Response) => {
    const period = parsePeriod(req.query.period);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const payload = await cacheData(
      `plausible:events:${period}:${limit}`,
      () => fetchCustomEvents(period, limit),
      CacheTTL.SHORT,
    );
    return response.ok(req, res, { period, items: payload }, 'Custom events');
  });

  return { overview, status, topPages, topEntries, events };
}

export type AnalyticsController = ReturnType<typeof createAnalyticsController>;
export type { PlausiblePeriod };
