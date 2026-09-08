# Modules

Each folder under `modules/` is a **bounded context** for the barthez-kenwou.dev
portfolio backend.

**Platform:** auth, users, rbac, oauth, files, backup, notifications, system.

**Portfolio content:** blog, projects, services, skills, experiences, education,
certifications, testimonials, achievements, references, languages,
contact-infos, contact-responses, cv.

## Required layout

```
module-name/
├── domain/           # Entities, value objects, repository ports, domain errors
├── application/      # Use cases (commands / queries), DTOs, application services
├── infrastructure/   # Prisma repos, external providers, mappers
├── presentation/     # Controllers, routes, express-validator schemas, serializers
├── index.ts          # Public module API (routes + bootstrap hooks)
└── README.md         # Module purpose & extension points
```

## Dependency rules

```
presentation  →  application  →  domain
infrastructure → domain (implements ports)
domain ✗→ express | prisma | redis | aws
```

## Adding a new module

1. Copy the skeleton from an existing portfolio module (or `modules/auth/`).
2. Register routes in `src/app/routes/index.ts`.
3. Wire dependencies in `src/app/container/index.ts`.
4. Document the module in `docs/architecture/modules.md`.
5. Add OpenAPI path generators under `docs/api/generator/paths/` and run
   `npm run generate:openapi`.

Files expose HTTP at `{API_PREFIX}/files` (presign). System owns health,
metrics, Bull Board, `GET {API_PREFIX}/admin/audit`, and
`GET {API_PREFIX}/admin/dashboard`. CV is a public aggregate at
`{API_PREFIX}/cv`. Recipe:
[docs/architecture/extending.md](../../docs/architecture/extending.md).
