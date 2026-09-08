# Infrastructure scripts (`infra/scripts/`)

Single home for ops helpers, bootstrap tools, and QA scripts. There is no
root-level `scripts/` folder — use this directory (or the `npm run …` aliases).

## Compose / stack helpers

| Script                | Description                                            |
| --------------------- | ------------------------------------------------------ |
| `start_app.sh`        | Core services (backend, Mongo, Redis, …)               |
| `start_monitoring.sh` | Prometheus / Grafana / Loki (app should already be up) |
| `stop_app.sh`         | Stop core services                                     |
| `stop_monitoring.sh`  | Stop monitoring services                               |
| `status.sh`           | Status of application + monitoring                     |
| `full_start.sh`       | App first, then monitoring                             |
| `full_stop.sh`        | Monitoring first, then app                             |
| `start-mongo.sh`      | Mongo container entrypoint (replica set)               |
| `init-minio.sh`       | Bucket bootstrap                                       |
| `init-clamav.sh`      | ClamAV helper                                          |

These do not set Node `PROCESS_ROLE`; that comes from `.env` / the process
environment.

```bash
chmod +x infra/scripts/*.sh
./infra/scripts/full_start.sh
```

Everyday development: `npm run docker:up` / `npm run docker:tools`.

## Keys, scaffold, bootstrap

| Script / npm alias                  | Description                                  |
| ----------------------------------- | -------------------------------------------- |
| `npm run keys:generate`             | RS256 PEMs into `./keys` (gitignored)        |
| `npm run scaffold:module -- <name>` | Generate a bounded-context module            |
| `npm run bootstrap:admin`           | Local verified super-admin for route testing |

## Live QA

| Script / npm alias              | Description                                       |
| ------------------------------- | ------------------------------------------------- |
| `npm run test:e2e:live`         | Full live endpoint suite (`e2e-all-routes.mjs`)   |
| `npm run test:load`             | k6 suite with temporary rate-limit raise          |
| `npm run test:routes:portfolio` | Portfolio CRUD smoke (`test-portfolio-routes.py`) |
| `smoke-routes.sh`               | Lighter curl smoke against `:3000`                |

Compose volume mounts under `infra/docker/*.yml` use `../scripts/…` relative to
`infra/docker/` — that still resolves to **this** folder.
