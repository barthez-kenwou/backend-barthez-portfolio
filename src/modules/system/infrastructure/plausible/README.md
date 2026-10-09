# Plausible CE — admin analytics

Server-side Stats API proxy for the CMS dashboard (`/api/v1/admin/analytics/*`).

## Env

```bash
PLAUSIBLE_BASE_URL=https://analytics.zenora360.com
PLAUSIBLE_SITE_ID=barthez-kenwou.dev
PLAUSIBLE_API_KEY=          # Stats API key (never expose to the SPA)
PLAUSIBLE_PUBLIC_URL=https://analytics.zenora360.com/barthez-kenwou.dev
```

Create the key in Plausible CE → Settings → API keys (team with access to the
site).

## Endpoints (admin JWT)

| Method | Path                                                  | Purpose                                             |
| ------ | ----------------------------------------------------- | --------------------------------------------------- |
| GET    | `/admin/analytics/status`                             | Configured? + public UI URL                         |
| GET    | `/admin/analytics/overview?period=7d`                 | Aggregate + top pages/blogs/projects/sources/events |
| GET    | `/admin/analytics/top-pages?period=7d&limit=10`       | Breakdown `event:page`                              |
| GET    | `/admin/analytics/top-entries?prefix=/blog&period=7d` | Filtered pages (`/blog`, `/projects`)               |
| GET    | `/admin/analytics/events?period=7d`                   | Breakdown `event:name` (custom goals)               |

Responses are cached ~60s (Redis + local).

## Custom events (goals to create in Plausible UI)

Register these as custom events / goals so they appear in breakdowns:

- `cta_click` — props: `cta_id`, `location`, `href`
- `cv_download` — props: `locale`, `source`
- `contact_click` — props: `channel`
- `newsletter_subscribe` — props: `source`, `locale`
- `outbound_click` — props: `url`, `label`
- `scroll_depth` — props: `path`, `depth` (25/50/75/100)
- `engagement_time` — props: `path`, `seconds`
- `video_play` / `video_progress` / `video_complete` — props: `video_id`,
  `percent?`
- `blog_read` — props: `slug`, `depth`
- `project_view` — props: `project`

Fired from the public SPA via `window.plausible` (`src/app/lib/analytics.ts` on
the frontend). No PII.
