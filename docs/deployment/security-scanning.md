# Security scanning

Local and CI controls for SCA (dependencies), SAST (static analysis), and
secrets.

## Tools (three SCA channels)

| Tool            | Role                     | Local                                                                 | CI                                      |
| --------------- | ------------------------ | --------------------------------------------------------------------- | --------------------------------------- |
| **npm audit**   | Node advisory DB         | `npm run security:audit`                                              | `.github/workflows/security.yml`        |
| **Trivy**       | FS + lockfile + IaC      | `npm run security:trivy` (needs vulndb; prefer CI if download stalls) | `trivy-fs` + `trivy-config` jobs        |
| **OSV Scanner** | Google OSV lockfile scan | `osv-scanner -L package-lock.json`                                    | `osv-scanner-action/osv-scanner-action` |

SAST:

| Tool                                       | Role                                                      |
| ------------------------------------------ | --------------------------------------------------------- |
| ESLint (`eslint-plugin-security`, SonarJS) | Pattern-based code issues (`npm run lint:ci`)             |
| CodeQL                                     | GitHub advanced analysis (`.github/workflows/codeql.yml`) |

Secrets:

| Tool     | Role                                              |
| -------- | ------------------------------------------------- |
| Gitleaks | History + working tree secrets (`.gitleaks.toml`) |

```bash
npm run security:audit
npm run security:secrets
# Optional when Docker + Trivy DB are reachable:
npm run security:trivy
```

## Acceptable residual risk

Production CI fails on **high/critical** for npm audit and Trivy
(`ignore-unfixed: true`). Prefer fixing via `overrides` or direct bumps; do
**not** run `npm audit fix --force` blindly — it may downgrade Prisma / MinIO or
jump Express to v5.

**Lockfile policy:** only `package-lock.json` is scanned / committed. Do not add
`bun.lock` / `yarn.lock` — a stale Bun lock made Trivy report HIGH/CRITICAL
while npm stayed clean.

Known **moderate** residual (tracked, not forced):

| Package                     | Why kept                                                                                                                                                                               |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stream-json` (via `minio`) | Fixed in 3.x but MinIO still imports the 1.x path layout; forcing 3.x breaks MinIO ESM imports. Ignored in `osv-scanner.toml` (`GHSA-528h-pc64-c93x`) to match npm audit high+ policy. |
| `vitest` 3.x (dev)          | `GHSA-82fw-gwwq-j7x9` fixed only in Vitest **4.1.11+**. Major bump deferred; ignored in `osv-scanner.toml` (devDependency, not in production image).                                   |

## TypeScript pin

Keep `typescript` on **`~5.9.x`**. TypeScript **7** is incompatible with
`@typescript-eslint` (peer still `<6.1.0`, no TS7 compiler API yet). Dependabot
ignores TS / Prisma / Vitest majors — see `.github/dependabot.yml`. Do **not**
merge mega “development-deps” PRs that bump TypeScript to 7.

`file-type` is pinned to **≥22** (ESM, dynamic import + ambient shim under
`src/types/shims/`) to clear GHSA-5v7r-6r5c-r473.

## Overrides

`package.json` → `overrides` pins patched transitive versions (`protobufjs`,
`qs`, `validator`, `cookie`, `decode-uri-component`, `minimatch`,
`brace-expansion`, `ip-address`, `moment`, `fast-uri`, nested
`markdownlint-cli2` → `js-yaml` / `markdown-it`, …) without waiting for every
upstream release.

## Dependency Review

Requires **Dependency graph** enabled (`Settings → Security → Code security`).
Until then the workflow soft-fails unless repo variable
`DEPENDENCY_REVIEW_ENFORCE=true`.

## After dependency bumps

```bash
npm run security:audit
npm run type-check
npm run test:unit
npm run security:secrets
```
