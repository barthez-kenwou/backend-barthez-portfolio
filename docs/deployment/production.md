# Production

Checklist for running Barthez Kenwou Portfolio Backend beyond local Compose.
Adjust to your cloud and compliance needs.

## Continuous delivery (GHCR → VPS)

1. `docker.yml` builds `infra/docker/Dockerfile` and pushes to GHCR (`main`,
   `latest`, `sha-<full-commit>`).
2. `deploy-vps.yml` SSHs to the host, sets `IMAGE_REF`, runs
   `docker compose -f infra/docker/docker-compose.deploy.yml pull && up`.
3. On the VPS, keep a **git checkout** of the repo. Runtime env is the **root**
   `.env` (from `.env.example`). Compose file used by CD:
   [`infra/docker/docker-compose.deploy.yml`](../../infra/docker/docker-compose.deploy.yml)
   (`env_file: ../../.env` — no duplicate env under `infra/docker/`).

Human setup (secrets, OVH, PAT, Environments): see the root tutorial
[`github-vps.md`](./github-vps.md).

App `.env` and `keys/` stay on the server — Actions never injects runtime
DB/SMTP secrets into the image.

## Secrets

- Keep the runtime `.env` on the host (or a secret manager that **writes** that
  file). Do not bake production credentials into images.
- **Infisical:** `INFISICAL_*` env keys are mapped into
  `config.features.infisical` as **placeholders only** — this template does
  **not** ship an Infisical SDK client or boot-time sync. Use the
  CLI/`infisical export` on the VPS (or Vault / Doppler) to materialize `.env`
  until you wire a client yourself.
- Rotate OAuth client secrets, SMTP credentials, MinIO/S3 keys,
  `BACKUP_ENCRYPTION_KEY`, and `AUTH_ENCRYPTION_KEY` on a schedule.
- Set `ADMIN_BASIC_PASSWORD` to a non-default value. `validateRuntimeConfig()`
  refuses to boot in production if it is empty or still `admin`.
- Disable Swagger in public environments (`SWAGGER_ENABLED=false`) even though
  the UI is Basic-auth gated.

## JWT keys

RS256 expects private/public PEM files on disk:

- `JWT_PRIVATE_KEY_PATH` / `JWT_PUBLIC_KEY_PATH`
- `JWT_REFRESH_PRIVATE_KEY_PATH` / `JWT_REFRESH_PUBLIC_KEY_PATH`

Canonical layout is the repo-root `keys/` directory (see
[jwt-keys.md](./jwt-keys.md)).

Production pattern:

1. Run `npm run keys:generate` (or equivalent `openssl`) **outside** the image
   build.
2. Mount PEMs read-only into the container (`./keys:/app/keys:ro` or
   `/run/secrets/…`).
3. Point `JWT_*_KEY_PATH` at the mount.
4. Restrict filesystem permissions; do not commit private keys.

Missing or empty PEMs abort boot. HS256 `JWT_SECRET` is **not** used.

## Auth encryption and cookies

- `AUTH_ENCRYPTION_KEY` is **required in production** (OAuth provider tokens and
  TOTP secrets at rest, AES-256-GCM).
- `COOKIE_EXPIRES_IN` must be a duration (`7d`) or milliseconds. Align with
  `JWT_REFRESH_EXPIRES_IN`.
- Leave `COOKIE_DOMAIN` empty for host-only cookies unless you explicitly need a
  parent domain.
- Restrict OAuth post-login redirects with `OAUTH_ALLOWED_ORIGINS`
  (comma-separated). `CLIENT_URL` is always allowed.
- Enable CSRF for browser cookie flows (`ALLOW_CSRF_PROTECTION=true`).

## Process roles

`PROCESS_ROLE` controls what a replica does:

| Value    | HTTP listen | BullMQ workers + crons |
| -------- | ----------- | ---------------------- |
| `all`    | yes         | yes                    |
| `api`    | yes         | no                     |
| `worker` | no          | yes                    |

Invalid values fall back to `all`. Template default is `all` (one process).
Production replicas should split `api` and `worker`.

Do **not** point a worker-only container’s Docker `HEALTHCHECK` at `/health` —
that process never binds a port. Probe API replicas only.

## Fail-closed bootstrap

HTTP listen happens **after** `bootstrapApplication()`:

1. `validateRuntimeConfig()` — PEMs present, cookie TTL sane, production
   operator password and `AUTH_ENCRYPTION_KEY` set.
2. RBAC seed (`seedSystemRolesAndPermissions`).
3. Object-storage bucket ensure.
4. SMTP transport verify — **throws in production** on failure.
5. Workers + repeatable jobs unless `PROCESS_ROLE=api`.
6. Then `app.listen` (skipped entirely when `PROCESS_ROLE=worker`).

Tests skip this bootstrap so Vitest can import the Express app without side
effects.

## Graceful shutdown

`SIGTERM` / `SIGINT` drain HTTP (25s timeout), stop workers, then close queues,
Redis, and Prisma. Worker-only processes pass `server=null`.

## Reverse proxy (Nginx)

Compose ships `infra/nginx/default.conf`. Public locations are **only**:

- `GET /health` (and `/health/live`, `/health/ready` under that prefix)
- `/api/` (versioned REST)

`client_max_body_size` is **2m** (avatar multipart). Larger objects must use
presigned PUT to MinIO/S3, not the API body.

`/metrics`, `/api-docs`, and `/admin` return **404 at the edge**. Scrape and
operator UIs must hit `backend:3000` on the private network.

In production:

- Terminate TLS at the proxy or mesh.
- Set `TRUST_PROXY_HOPS` to the hop count in front of Express (default `1`) so
  `req.ip`, rate limits, and audit logs see the client, not the proxy.
- Forward `X-Forwarded-*` correctly so cookies and secure flags behave.
- Rate-limit at the edge in addition to Express rate limits.

## Operator UIs

| Surface         | Auth                                                                  | Public Nginx |
| --------------- | --------------------------------------------------------------------- | ------------ |
| `/api-docs`     | HTTP Basic (`ADMIN_BASIC_*`, fallback `SWAGGER_*`)                    | no           |
| `/metrics`      | HTTP Basic (skipped only when `NODE_ENV=test`)                        | no           |
| `/admin/queues` | HTTP Basic **then** JWT **then** `isAdmin` (`admin` or `super-admin`) | no           |

CORS allowlist is `CLIENT_URL` plus `CLIENT_URLS` (CSV). Never `*`.

## Health and metrics

| Endpoint            | Meaning                                     |
| ------------------- | ------------------------------------------- |
| `GET /health`       | Ready: Mongo + Redis. 503 if a dep is down. |
| `GET /health/ready` | Same as `/health`.                          |
| `GET /health/live`  | Process up. Does **not** check deps.        |
| `GET /metrics`      | Prometheus scrape (Basic auth, private net) |

Compose/Dockerfile `HEALTHCHECK` uses `GET /health/live` (process up). Wire
kube/load-balancer readiness to `/health` or `/health/ready`; liveness to
`/health/live`.

## Redis TLS

Set `REDIS_TLS=true` (and optionally `REDIS_TLS_REJECT_UNAUTHORIZED`) when Redis
is reached over TLS. Username/password via `REDIS_USERNAME` / `REDIS_PASSWORD`.

## Data and backups

- Prefer managed MongoDB or a replica set with automated backups.
- Application-level encrypted dumps use the backup module + `BACKUP_CRON`; see
  [Backups](../guides/backup.md). Verify restore procedures.
- Redis should be durable enough for your queue tolerance (AOF is enabled in the
  sample Compose Redis).

## Bootstrap portfolio content (one-shot)

Deploy does **not** seed blogs/projects/etc. Boot only seeds system RBAC. To
load the JSON fixtures (`prisma/seed/data/`) into an **empty** production DB
once:

1. Stack healthy (`backend-api` up, Mongo reachable).
2. Prefer a backup first (even if empty — practice the restore path).
3. From the VPS checkout (repo root), with the same `.env` / `.env.image` as
   deploy:

```bash
CONFIRM_PROD_SEED=yes docker compose -f infra/docker/docker-compose.deploy.yml \
  --env-file .env --env-file .env.image --profile seed run --rm portfolio-seed
```

Without `CONFIRM_PROD_SEED=yes`, the job exits and refuses to wipe. The job
**deletes** portfolio CMS collections then re-inserts fixtures; users / RBAC /
tokens are untouched.

After this, manage content via the CMS admin. Do not re-run on every push.

## Bootstrap SUPER_ADMIN (one-shot)

Deploy does **not** create an operator user. Create (or refresh) a verified
`super-admin` once from the VPS — credentials on the **command line only**,
never committed and preferably not left permanently in `.env`.

```bash
CONFIRM_PROD_BOOTSTRAP_ADMIN=yes \
BOOTSTRAP_ADMIN_EMAIL='you@example.com' \
BOOTSTRAP_ADMIN_PASSWORD='use-a-long-unique-password' \
BOOTSTRAP_ADMIN_FIRST_NAME='Barthez' \
BOOTSTRAP_ADMIN_LAST_NAME='Kenwou' \
BOOTSTRAP_ADMIN_PHONE='655 66 688' \
BOOTSTRAP_ADMIN_AVATAR_URL='https://example.com/avatar.jpeg' \
docker compose -f infra/docker/docker-compose.deploy.yml \
  --env-file .env --env-file .env.image --profile bootstrap-admin \
  run --rm bootstrap-admin
```

Requires the image that contains `dist/scripts/bootstrap-super-admin.js`.
Without `CONFIRM_PROD_BOOTSTRAP_ADMIN=yes`, the job refuses. The script upserts
by email, hashes the password (bcrypt), sets `isActive` / `isVerified`, and
assigns `SUPER_ADMIN`.

After success: login via the admin UI / auth API, then remove the password from
your shell history if needed (`history -d`). Rotate the password if it was ever
pasted into chat, tickets, or git.

## Security headers and cookies

- Confirm `COOKIE_SECURE`, `COOKIE_SAME_SITE`, and domain settings for your
  public URL. `COOKIE_EXPIRES_IN` is Express `maxAge` (use `7d`, not `2`).
- Enable CSRF protection when browser cookie flows require it
  (`ALLOW_CSRF_PROTECTION`). `GET /csrf-token` returns JSON only.
- Keep Helmet / CSP report URI configured; monitor CSP reports.

## Related

- [Docker](./docker.md)
- [Observability](./observability.md)
- [Configuration](../architecture/configuration.md)
- [Platform kernel](../architecture/platform-kernel.md)
- [SECURITY.md](../../SECURITY.md)
