# Skills module

Portfolio skill bounded context. Follow
[dependency rules](../../../docs/architecture/dependency-rules.md).

## Domain fields

- `name` (string)
- `category` (string)
- `level` (number)
- `icon` (string)
- `sortOrder` (number)
- `ownerId` (set from authenticated user on create)
- timestamps + soft-delete (`deletedAt`)

## Layout

```
skills/
├── domain/            # entities, errors, repository ports
├── application/       # commands, queries, DTOs, ports
├── infrastructure/    # Prisma adapter + mapper
├── presentation/      # HTTP routes, validation, serializers
├── index.ts           # createSkillModule / createDefaultSkillDeps
└── README.md
```

## HTTP surface

Mounted at `{API_PREFIX}/skills`.

| Method | Path        | Permission                          |
| ------ | ----------- | ----------------------------------- |
| GET    | `/`         | public                              |
| GET    | `/:skillId` | public                              |
| POST   | `/`         | `skill:create`                      |
| PUT    | `/:skillId` | `skill:update:own` (admin elevates) |
| DELETE | `/:skillId` | `skill:delete:own` (admin elevates) |

## Ownership

`ownerId` is assigned from `req.user.id` on create. Update/delete allow the
owner or an admin (`ADMIN` / `SUPER_ADMIN` via `isAdmin`).

## Persistence

Prisma model: `prisma/models/skill.prisma` (client accessor: `prisma.skill`).
Soft-delete uses `prismaNotDeleted` (Mongo-safe). Lists order by `sortOrder`
asc.

## Public API

```ts
import {
  createSkillModule,
  createDefaultSkillDeps,
  createSkillRouter,
} from '@/modules/skills';
```
