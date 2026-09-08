# References module

Portfolio reference bounded context. Follow
[dependency rules](../../../docs/architecture/dependency-rules.md).

## Domain fields

- `name` (string)
- `roleFr` (string)
- `roleEn` (string)
- `company` (string)
- `email` (string)
- `phone` (string)
- `sortOrder` (number)
- `ownerId` (set from authenticated user on create)
- timestamps + soft-delete (`deletedAt`)

## Layout

```
references/
├── domain/            # entities, errors, repository ports
├── application/       # commands, queries, DTOs, ports
├── infrastructure/    # Prisma adapter + mapper
├── presentation/      # HTTP routes, validation, serializers
├── index.ts           # createReferenceModule / createDefaultReferenceDeps
└── README.md
```

## HTTP surface

Mounted at `{API_PREFIX}/references`.

| Method | Path            | Permission                              |
| ------ | --------------- | --------------------------------------- |
| GET    | `/`             | `reference:read` (PII, auth required)   |
| GET    | `/:referenceId` | `reference:read` (PII, auth required)   |
| POST   | `/`             | `reference:create`                      |
| PUT    | `/:referenceId` | `reference:update:own` (admin elevates) |
| DELETE | `/:referenceId` | `reference:delete:own` (admin elevates) |

## Ownership

`ownerId` is assigned from `req.user.id` on create. Update/delete allow the
owner or an admin (`ADMIN` / `SUPER_ADMIN` via `isAdmin`).

## Persistence

Prisma model: `prisma/models/reference.prisma` (client accessor:
`prisma.reference`). Soft-delete uses `prismaNotDeleted` (Mongo-safe). Lists
order by `sortOrder` asc.

## Public API

```ts
import {
  createReferenceModule,
  createDefaultReferenceDeps,
  createReferenceRouter,
} from '@/modules/references';
```
