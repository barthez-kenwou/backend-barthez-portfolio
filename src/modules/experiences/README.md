# Experiences module

Portfolio experience bounded context. Follow
[dependency rules](../../../docs/architecture/dependency-rules.md).

## Domain fields

- `titleFr` (string)
- `titleEn` (string)
- `companyFr` (string)
- `companyEn` (string)
- `period` (string)
- `descriptionFr` (string[])
- `descriptionEn` (string[])
- `sortOrder` (number)
- `ownerId` (set from authenticated user on create)
- timestamps + soft-delete (`deletedAt`)

## Layout

```
experiences/
├── domain/            # entities, errors, repository ports
├── application/       # commands, queries, DTOs, ports
├── infrastructure/    # Prisma adapter + mapper
├── presentation/      # HTTP routes, validation, serializers
├── index.ts           # createExperienceModule / createDefaultExperienceDeps
└── README.md
```

## HTTP surface

Mounted at `{API_PREFIX}/experiences`.

| Method | Path             | Permission                               |
| ------ | ---------------- | ---------------------------------------- |
| GET    | `/`              | public                                   |
| GET    | `/:experienceId` | public                                   |
| POST   | `/`              | `experience:create`                      |
| PUT    | `/:experienceId` | `experience:update:own` (admin elevates) |
| DELETE | `/:experienceId` | `experience:delete:own` (admin elevates) |

## Ownership

`ownerId` is assigned from `req.user.id` on create. Update/delete allow the
owner or an admin (`ADMIN` / `SUPER_ADMIN` via `isAdmin`).

## Persistence

Prisma model: `prisma/models/experience.prisma` (client accessor:
`prisma.experience`). Soft-delete uses `prismaNotDeleted` (Mongo-safe). Lists
order by `sortOrder` asc.

## Public API

```ts
import {
  createExperienceModule,
  createDefaultExperienceDeps,
  createExperienceRouter,
} from '@/modules/experiences';
```
