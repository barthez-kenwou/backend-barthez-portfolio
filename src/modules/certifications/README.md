# Certifications module

Portfolio certification bounded context. Follow
[dependency rules](../../../docs/architecture/dependency-rules.md).

## Domain fields

- `name` (string)
- `issuer` (string)
- `year` (string)
- `link` (string, optional)
- `sortOrder` (number)
- `ownerId` (set from authenticated user on create)
- timestamps + soft-delete (`deletedAt`)

## Layout

```
certifications/
├── domain/            # entities, errors, repository ports
├── application/       # commands, queries, DTOs, ports
├── infrastructure/    # Prisma adapter + mapper
├── presentation/      # HTTP routes, validation, serializers
├── index.ts           # createCertificationModule / createDefaultCertificationDeps
└── README.md
```

## HTTP surface

Mounted at `{API_PREFIX}/certifications`.

| Method | Path                | Permission                                  |
| ------ | ------------------- | ------------------------------------------- |
| GET    | `/`                 | public                                      |
| GET    | `/:certificationId` | public                                      |
| POST   | `/`                 | `certification:create`                      |
| PUT    | `/:certificationId` | `certification:update:own` (admin elevates) |
| DELETE | `/:certificationId` | `certification:delete:own` (admin elevates) |

## Ownership

`ownerId` is assigned from `req.user.id` on create. Update/delete allow the
owner or an admin (`ADMIN` / `SUPER_ADMIN` via `isAdmin`).

## Persistence

Prisma model: `prisma/models/certification.prisma` (client accessor:
`prisma.certification`). Soft-delete uses `prismaNotDeleted` (Mongo-safe). Lists
order by `sortOrder` asc.

## Public API

```ts
import {
  createCertificationModule,
  createDefaultCertificationDeps,
  createCertificationRouter,
} from '@/modules/certifications';
```
