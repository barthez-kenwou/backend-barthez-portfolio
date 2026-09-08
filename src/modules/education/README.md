# Education module

Portfolio education bounded context. Follow
[dependency rules](../../../docs/architecture/dependency-rules.md).

## Domain fields

- `degreeFr` (string)
- `degreeEn` (string)
- `school` (string)
- `period` (string)
- `link` (string, optional)
- `sortOrder` (number)
- `ownerId` (set from authenticated user on create)
- timestamps + soft-delete (`deletedAt`)

## Layout

```
education/
├── domain/            # entities, errors, repository ports
├── application/       # commands, queries, DTOs, ports
├── infrastructure/    # Prisma adapter + mapper
├── presentation/      # HTTP routes, validation, serializers
├── index.ts           # createEducationModule / createDefaultEducationDeps
└── README.md
```

## HTTP surface

Mounted at `{API_PREFIX}/education`.

| Method | Path            | Permission                              |
| ------ | --------------- | --------------------------------------- |
| GET    | `/`             | public                                  |
| GET    | `/:educationId` | public                                  |
| POST   | `/`             | `education:create`                      |
| PUT    | `/:educationId` | `education:update:own` (admin elevates) |
| DELETE | `/:educationId` | `education:delete:own` (admin elevates) |

## Ownership

`ownerId` is assigned from `req.user.id` on create. Update/delete allow the
owner or an admin (`ADMIN` / `SUPER_ADMIN` via `isAdmin`).

## Persistence

Prisma model: `prisma/models/education.prisma` (client accessor:
`prisma.education`). Soft-delete uses `prismaNotDeleted` (Mongo-safe). Lists
order by `sortOrder` asc.

## Public API

```ts
import {
  createEducationModule,
  createDefaultEducationDeps,
  createEducationRouter,
} from '@/modules/education';
```
