# Plausible CE — admin analytics

Server-side Stats API proxy for the CMS dashboard (`/api/v1/admin/analytics/*`).

## Env

```bash
# Server-to-server URL — prefer INTERNAL (Docker DNS / private host).
# Public https://analytics.… is often behind Cloudflare Bot Fight → 403 HTML
# "Just a moment..." which breaks the Stats API from the API container.
PLAUSIBLE_BASE_URL=http://plausible:8000
PLAUSIBLE_SITE_ID=barthez-kenwou.dev
PLAUSIBLE_API_KEY=          # Stats API key (never expose to the SPA)
# Browser link for operators (public UI is fine)
PLAUSIBLE_PUBLIC_URL=https://analytics.zenora360.com/barthez-kenwou.dev
```

Create the key in Plausible CE → **Settings → API keys → New API Key → Stats
API** (not Sites API, not a shared-link password). Select the **same team** that
owns the site. `PLAUSIBLE_SITE_ID` must match the domain field in Plausible
exactly (e.g. `barthez-kenwou.dev`, not `www.…`).

After editing `.env`, recreate containers (restart does **not** reload
`env_file`):

```bash
docker compose -f infra/docker/docker-compose.deploy.yml up -d --force-recreate backend-api backend-worker
```

Smoke-test from the API container:

```bash
docker exec Barthez-Kenwou-Portfolio-API-http printenv PLAUSIBLE_SITE_ID PLAUSIBLE_API_KEY | sed 's/=.*/=***/'
docker exec Barthez-Kenwou-Portfolio-API-http node -e "
const base=process.env.PLAUSIBLE_BASE_URL.replace(/\/\$/,'');
const site=process.env.PLAUSIBLE_SITE_ID;
const key=process.env.PLAUSIBLE_API_KEY;
fetch(base+'/api/v1/stats/aggregate?site_id='+encodeURIComponent(site)+'&period=7d&metrics=visitors',{
  headers:{Authorization:'Bearer '+key,Accept:'application/json'}
}).then(async r=>console.log(r.status, await r.text())).catch(e=>console.error(e));
"

## Endpoints (admin JWT)

| Method | Path                                                  | Purpose                                             |
| ------ | ----------------------------------------------------- | --------------------------------------------------- |
| GET    | `/admin/analytics/status`                             | Configured? + public UI URL                         |
| GET    | `/admin/analytics/overview?period=7d`                 | Aggregate + timeseries + tops + events              |
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
```
