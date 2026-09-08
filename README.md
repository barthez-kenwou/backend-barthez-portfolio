# Barthez Kenwou Portfolio Backend

[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0-green.svg)](./docs/api/openapi.yaml)
[![Site](https://img.shields.io/badge/site-barthez--kenwou.dev-0F766E.svg)](https://barthez-kenwou.dev)

**Express + TypeScript modular monolith** powering
[barthez-kenwou.dev](https://barthez-kenwou.dev) — public portfolio content APIs
and the `/barthez-admin` CMS back-office.

Pairs with the frontend repo
[`barthez-kenwou-porfolio`](https://github.com/barthez-kenwou/barthez-kenwou-porfolio).

---

## What this API serves

| Surface         | Prefix                                 | Role                             |
| --------------- | -------------------------------------- | -------------------------------- |
| Auth / sessions | `/api/v1/auth`                         | Admin login, OTP, refresh, TOTP  |
| Portfolio CMS   | `/api/v1/{projects,blogs,skills,…}`    | Public reads + admin CRUD        |
| Contact         | `POST /api/v1/contact-responses`       | Public form → admin inbox        |
| Feedback        | `POST /api/v1/testimonials/feedback`   | Public testimonials (pending)    |
| CV aggregate    | `GET /api/v1/cv`                       | Assembled resume payload         |
| Dashboard       | `GET /api/v1/admin/dashboard`          | CMS counters                     |
| Ops             | `/health`, `/metrics`, `/admin/queues` | Liveness, Prometheus, Bull Board |

### Domain modules (portfolio)

`projects` · `blogs` · `services` · `skills` · `experiences` · `education` ·
`certifications` · `testimonials` · `achievements` · `references` ·
`contact-infos` · `contact-responses` · `languages` · `cv`

### Platform modules (kept)

`auth` · `users` · `rbac` · `oauth` · `files` · `system` · `backup` ·
`notifications`

---

## Architecture

```text
src/
├── app/               # Composition root (config, DI, middleware, routes)
├── modules/           # Bounded contexts (portfolio + platform)
│   └── <module>/
│       ├── domain/
│       ├── application/
│       ├── infrastructure/
│       └── presentation/
└── shared/            # DB, cache, mail, queue, storage, logging, flags
```

Deep dive: [docs/architecture/overview.md](./docs/architecture/overview.md) ·
[modules catalog](./docs/architecture/modules.md) ·
[dependency rules](./docs/architecture/dependency-rules.md)

### Naming conventions

| Element       | Convention       | Example                              |
| ------------- | ---------------- | ------------------------------------ |
| Folders       | kebab-case       | `contact-infos`, `contact-responses` |
| Files         | kebab-case       | `create-project.command.ts`          |
| Functions     | camelCase        | `getUserById`, `createProject`       |
| Constants     | UPPER_SNAKE_CASE | `SYSTEM_ROLES`, `QUEUE_NAMES`        |
| Prisma models | PascalCase       | `Project`, `ContactInfo`             |
| Prisma fields | camelCase        | `titleFr`, `isPublished`             |

### Configuration rule

**Never** read `process.env` outside `src/app/config`. Import `config` from
`@/app/config`. ESLint enforces this.

Single env file at the **repo root**: `.env` (from `.env.example`).

---

## Quick start

```bash
git clone https://github.com/barthez-kenwou/backend-barthez-portfolio.git
cd backend-barthez-portfolio
cp .env.example .env

npm install
npm run keys:generate
npm run docker:up
npm run prisma:push
npm run prisma:seed
npm run dev
```

| Surface       | URL                                                   | Notes                  |
| ------------- | ----------------------------------------------------- | ---------------------- |
| API           | [`/api/v1`](http://localhost:3000/api/v1)             | Versioned REST         |
| Swagger UI    | [`/api-docs`](http://localhost:3000/api-docs)         | HTTP Basic             |
| Health        | [`/health`](http://localhost:3000/health)             | Mongo + Redis          |
| Metrics       | [`/metrics`](http://localhost:3000/metrics)           | HTTP Basic             |
| Bull Board    | [`/admin/queues`](http://localhost:3000/admin/queues) | Basic + JWT admin      |
| MailHog       | [`:8025`](http://localhost:8025)                      | Dev SMTP UI            |
| MinIO Console | [`:9001`](http://localhost:9001)                      | Object storage         |
| Prisma Studio | [`:5555`](http://localhost:5555)                      | `npm run docker:tools` |

Frontend local default: `CLIENT_URL=http://localhost:5173` · production
`https://barthez-kenwou.dev`.

More detail:
[docs/development/getting-started.md](./docs/development/getting-started.md)

---

## Frontend alignment

Content shapes match the SPA entities under
`barthez-kenwou-porfolio/src/entities` and Admin CMS types (`IProject`, `IBlog`,
`IContactInfo`, `IContactResponse`, …).

| Admin page        | API                           |
| ----------------- | ----------------------------- |
| Dashboard         | `GET /api/v1/admin/dashboard` |
| Projects / editor | `/api/v1/projects`            |
| Blogs / editor    | `/api/v1/blogs`               |
| Services          | `/api/v1/services`            |
| Skills            | `/api/v1/skills`              |
| Certifications    | `/api/v1/certifications`      |
| Education         | `/api/v1/education`           |
| Experiences       | `/api/v1/experiences`         |
| Testimonials      | `/api/v1/testimonials`        |
| References        | `/api/v1/references`          |
| Contact info      | `/api/v1/contact-infos`       |
| Contact responses | `/api/v1/contact-responses`   |

Public site also consumes `GET /cv`, `GET /achievements`, `GET /languages`, and
public list endpoints (published filters).

Full contract: [docs/api/openapi.yaml](./docs/api/openapi.yaml)

---

## Documentation map

| Section               | Link                                                |
| --------------------- | --------------------------------------------------- |
| Documentation home    | [docs/README.md](./docs/README.md)                  |
| Architecture & ADRs   | [docs/architecture/](./docs/architecture/README.md) |
| Development / testing | [docs/development/](./docs/development/README.md)   |
| Docker & production   | [docs/deployment/](./docs/deployment/README.md)     |
| Guides                | [docs/guides/](./docs/guides/README.md)             |
| OpenAPI               | [docs/api/](./docs/api/README.md)                   |

---

## Scripts

| Script                                      | Description                                         |
| ------------------------------------------- | --------------------------------------------------- |
| `npm run dev`                               | Dev server with hot reload (`tsx watch`)            |
| `npm run dev:api` / `dev:worker`            | Split HTTP vs BullMQ (`PROCESS_ROLE`)               |
| `npm run keys:generate`                     | Create RS256 PEMs under `keys/`                     |
| `npm run build` / `npm start`               | Compile and run production build                    |
| `npm test` / `test:ci`                      | Vitest suites                                       |
| `npm run generate:openapi`                  | Regenerate OpenAPI YAML                             |
| `npm run scaffold:module`                   | Generate a domain module (`--wire`, `--with-audit`) |
| `npm run docker:up` / `docker:tools`        | Compose stacks                                      |
| `npm run prisma:generate` / `push` / `seed` | Database tooling                                    |
| `npm run validate`                          | Lint + types + tests + OpenAPI                      |

---

## Tech stack

Express 4 · TypeScript · MongoDB + Prisma · Redis · BullMQ · MinIO/S3 ·
Nodemailer · Flagsmith · Vitest · k6 · Docker Compose · OpenAPI 3 · Winston ·
GitHub Actions

---

## License

UNLICENSED © [Barthez Kenwou](https://barthez-kenwou.dev) — private portfolio
backend. See [LICENSE](./LICENSE) if present.
