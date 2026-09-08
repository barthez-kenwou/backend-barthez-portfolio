# Achievements module

Portfolio achievement bounded context. Follow
[dependency rules](../../../docs/architecture/dependency-rules.md).

## Domain fields

- `iconKey` (string)
- `value` (string)
- `labelFr` (string)
- `labelEn` (string)
- `sortOrder` (number)
- `ownerId` (set from authenticated user on create)
- timestamps + soft-delete (`deletedAt`)

## Layout

```
achievements/
├── domain/            # entities, errors, repository ports
├── application/       # commands, queries, DTOs, ports
├── infrastructure/    # Prisma adapter + mapper
├── presentation/      # HTTP routes, validation, serializers
├── index.ts           # createAchievementModule / createDefaultAchievementDeps
└── README.md
```

## HTTP surface

Mounted at `{API_PREFIX}/achievements`.

| Method | Path              | Permission                                |
| ------ | ----------------- | ----------------------------------------- |
| GET    | `/`               | public                                    |
| GET    | `/:achievementId` | public                                    |
| POST   | `/`               | `achievement:create`                      |
| PUT    | `/:achievementId` | `achievement:update:own` (admin elevates) |
| DELETE | `/:achievementId` | `achievement:delete:own` (admin elevates) |

## Ownership

`ownerId` is assigned from `req.user.id` on create. Update/delete allow the
owner or an admin (`ADMIN` / `SUPER_ADMIN` via `isAdmin`).

## Persistence

Prisma model: `prisma/models/achievement.prisma` (client accessor:
`prisma.achievement`). Soft-delete uses `prismaNotDeleted` (Mongo-safe). Lists
order by `sortOrder` asc.

## Public API

```ts
import {
  createAchievementModule,
  createDefaultAchievementDeps,
  createAchievementRouter,
} from '@/modules/achievements';
```
