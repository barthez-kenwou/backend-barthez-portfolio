# GitHub → GHCR → VPS deploy

Operational checklist for this template: GitHub Actions builds the image, pushes
to GHCR, then SSHs to a VPS and runs
[`docker-compose.deploy.yml`](../../infra/docker/docker-compose.deploy.yml).

> Companion to [production.md](./production.md) (app runtime) and
> [`.github/WORKFLOWS.md`](../../.github/WORKFLOWS.md) (workflow inventory).

## Flow

```text
Push to main
    │
    ▼
docker.yml     build Dockerfile → push GHCR
               tags: main | latest | sha-<full40>
    │
    ▼
deploy-vps.yml SSH → git pull (checkout) → compose pull/up
               local /health/live probe (authoritative)
```

**Two secret worlds (do not mix):**

| World           | Where                                      | Examples                                        |
| --------------- | ------------------------------------------ | ----------------------------------------------- |
| **CI / CD**     | GitHub Environment `production`            | `VPS_SSH_KEY`, `GHCR_PULL_TOKEN`                |
| **Runtime app** | Root `.env` on the VPS (+ Infisical later) | `DATABASE_URL`, `SMTP_*`, `AUTH_ENCRYPTION_KEY` |

Actions never inject the app `.env` into the image.

## APP_NAME (any value)

Compose names containers `${APP_NAME}-http` and `${APP_NAME}-worker`. Deploy
healthcheck reads `APP_NAME` from the VPS `.env` — use whatever you want:

```bash
APP_NAME=barthez-portfolio-api
# → containers: barthez-portfolio-api-http / barthez-portfolio-api-worker
```

## Object storage (MinIO local vs SeaweedFS / S3 in prod)

The app speaks **S3 API** via the MinIO JS client. MinIO in Compose is only a
local stand-in. In production you typically point the same env vars at
**SeaweedFS S3** (or AWS S3) and **do not** start the bundled MinIO service.

Deploy compose defaults: **no** MinIO container. Optional bundled MinIO:

```bash
COMPOSE_PROFILES=bundled-storage
```

### SeaweedFS example (recommended for your VPS)

SeaweedFS S3 gateway must be reachable from the API container (host IP, Docker
gateway, or shared network). Create buckets `app-uploads` and `backups` (or your
chosen names) beforehand if auto-create is disabled.

```bash
# Keep STORAGE_PROVIDER=minio — uploads (avatars/presign) always use MINIO_* today.
STORAGE_PROVIDER=minio

# Talk to Seaweed on the Docker network shared with NPM (web-proxy), NOT via Cloudflare.
MINIO_ENDPOINT=seaweed-s3
MINIO_PORT=8333
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=your-seaweed-access-key
MINIO_SECRET_KEY=your-seaweed-secret-key
MINIO_APP_BUCKET=app-uploads
MINIO_BACKUP_BUCKET=backups
MINIO_BASE_PATH=uploads/
MINIO_PUBLIC_URL=https://s3.zenora360.com
```

Do **not** set `COMPOSE_PROFILES=bundled-storage` when using SeaweedFS.

### Network note

If SeaweedFS runs on the VPS host (not in this compose), the API container must
reach it. Common options:

- `MINIO_ENDPOINT` = host IP on `docker0` / LAN
- attach SeaweedFS (or a reverse proxy) to `backend_network` / `web-proxy`
- publish Seaweed S3 on localhost and use
  `extra_hosts: host.docker.internal:host-gateway` (add if needed)

## Environment `production`

**Settings → Environments → `production`**

Deploy job uses `environment: production` — keep VPS secrets **only** here.

### Secrets (required)

| Secret         | Purpose                                |
| -------------- | -------------------------------------- |
| `VPS_HOST`     | SSH host / IP                          |
| `VPS_USER`     | SSH user (docker group preferred)      |
| `VPS_SSH_KEY`  | Private key PEM                        |
| `VPS_APP_PATH` | Absolute path to **git checkout** root |
| `VPS_SSH_PORT` | Optional; default `22`                 |

### Secrets (if GHCR package is private)

| Secret            | Purpose                     |
| ----------------- | --------------------------- |
| `GHCR_USERNAME`   | `docker login ghcr.io` user |
| `GHCR_PULL_TOKEN` | PAT with `read:packages`    |

### Variables

| Variable             | Purpose                                                    |
| -------------------- | ---------------------------------------------------------- |
| `CONTAINER_REGISTRY` | Default `ghcr.io`                                          |
| `DEPLOY_HEALTH_URL`  | Optional public URL; **local** container probe is required |

Public HTTPS probes often fail under Cloudflare bot challenges; the workflow
treats them as warnings.

## VPS checkout (once)

```bash
sudo mkdir -p /srv/internal && sudo chown "$USER:$USER" /srv/internal
cd /srv/internal
git clone git@github.com:<owner>/backend-barthez-portfolio.git backend-barthez-portfolio
cd backend-barthez-portfolio
cp .env.example .env   # set production values — real SMTP, not MailHog
npm ci && npm run keys:generate
# PEMs only as UID 1000 (container user). Do NOT chown -R keys/ to 1000.
sudo chown 1000:1000 keys/*.pem
sudo chmod 600 keys/*-private.pem
sudo chmod 644 keys/*-public.pem
sudo chown "$USER:$USER" keys

# Network shared with Nginx Proxy Manager (or equivalent)
docker network create web-proxy 2>/dev/null || true
```

`VPS_APP_PATH` must be this directory (contains `.env`, `keys/`, `infra/`).

See [jwt-keys.md](./jwt-keys.md) for permission details.

## Compose used by CD

File: `infra/docker/docker-compose.deploy.yml`

- Pulls `IMAGE_REF` (set by the workflow into `.env.image`)
- Single env source: **repo-root** `.env`
- Services: `backend-api` + `backend-worker` + mongo/redis/minio/clamav/nginx
- **No host `:80`** on nginx — edge proxy (NPM) already owns 80/443
- External network **`web-proxy`** (must exist before `compose up`)

```bash
# Manual smoke on the VPS
export IMAGE_REF=ghcr.io/<owner>/backend-barthez-portfolio:main
printf 'IMAGE_REF=%s\n' "$IMAGE_REF" > .env.image
docker compose -f infra/docker/docker-compose.deploy.yml \
  --env-file .env --env-file .env.image up -d
```

### Nginx Proxy Manager

1. Attach the target to `web-proxy` (compose already joins `nginx`; or connect
   `${APP_NAME}-http` manually).
2. Proxy host → `${NGINX_NAME}:80` **or** `${APP_NAME}-http:3000` (example:
   `barthez-portfolio-api-http:3000`).
3. Cloudflare SSL mode **Full** (not Flexible).
4. Bot Fight may 403 `curl` to the public URL — use a browser or allowlist.

## Fail-closed production `.env` (minimum)

| Variable                | Rule                                                |
| ----------------------- | --------------------------------------------------- |
| `NODE_ENV`              | `production`                                        |
| `ADMIN_BASIC_PASSWORD`  | Non-empty, ≠ `admin`                                |
| `AUTH_ENCRYPTION_KEY`   | Non-empty                                           |
| `ALLOW_CSRF_PROTECTION` | `true`                                              |
| `COOKIE_SECURE`         | `true`                                              |
| `CLAMAV_REQUIRED`       | `true`                                              |
| `BACKUP_ENCRYPTION_KEY` | Non-placeholder                                     |
| `REDIS_TLS`             | `false` for Compose Redis (no TLS)                  |
| `MINIO_USE_SSL`         | `false` for plain Seaweed/MinIO on LAN              |
| `MINIO_*`               | Point at SeaweedFS S3 (or enable `bundled-storage`) |
| `SMTP_*`                | Real provider (not `mailhog`)                       |
| `LOKI_ENABLED`          | `false` unless Loki is deployed                     |
| `SWAGGER_ENABLED`       | Prefer `false` on public hosts                      |

## Related

- [Docker](./docker.md) — local Compose + tools profile
- [Production](./production.md) — runtime hardening
- [Security scanning](./security-scanning.md)
- [JWT keys](./jwt-keys.md)
