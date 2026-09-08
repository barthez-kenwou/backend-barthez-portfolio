# Services module

Portfolio service bounded context. Follow
[dependency rules](../../../docs/architecture/dependency-rules.md).

## Domain fields

- `iconKey` (string)
- `titleFr` (string)
- `titleEn` (string)
- `descFr` (string)
- `descEn` (string)
- `featuresFr` (string[])
- `featuresEn` (string[])
- `priceEur` (number)
- `hourly` (boolean)
- `priceFr` (string)
- `priceEn` (string)
- `sortOrder` (number)
- `isPublished` (boolean)
- `ownerId` (set from authenticated user on create)
- timestamps + soft-delete (`deletedAt`)

## Layout

```
services/
├── domain/            # entities, errors, repository ports
├── application/       # commands, queries, DTOs, ports
├── infrastructure/    # Prisma adapter + mapper
├── presentation/      # HTTP routes, validation, serializers
├── index.ts           # createServiceModule / createDefaultServiceDeps
└── README.md
```

## HTTP surface

Mounted at `{API_PREFIX}/services`.

| Method | Path          | Permission                            |
| ------ | ------------- | ------------------------------------- |
| GET    | `/`           | public                                |
| GET    | `/:serviceId` | public                                |
| POST   | `/`           | `service:create`                      |
| PUT    | `/:serviceId` | `service:update:own` (admin elevates) |
| DELETE | `/:serviceId` | `service:delete:own` (admin elevates) |

## Ownership

`ownerId` is assigned from `req.user.id` on create. Update/delete allow the
owner or an admin (`ADMIN` / `SUPER_ADMIN` via `isAdmin`).

## Persistence

Prisma model: `prisma/models/service.prisma` (client accessor:
`prisma.service`). Soft-delete uses `prismaNotDeleted` (Mongo-safe). Lists order
by `sortOrder` asc.

## Public API

```ts
import {
  createServiceModule,
  createDefaultServiceDeps,
  createServiceRouter,
} from '@/modules/services';
```
