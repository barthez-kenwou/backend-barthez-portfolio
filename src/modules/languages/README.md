# Languages module

Portfolio language bounded context. Follow
[dependency rules](../../../docs/architecture/dependency-rules.md).

## Domain fields

- `language` (string)
- `proficiencyFr` (string)
- `proficiencyEn` (string)
- `sortOrder` (number)
- `ownerId` (set from authenticated user on create)
- timestamps + soft-delete (`deletedAt`)

## Layout

```
languages/
├── domain/            # entities, errors, repository ports
├── application/       # commands, queries, DTOs, ports
├── infrastructure/    # Prisma adapter + mapper
├── presentation/      # HTTP routes, validation, serializers
├── index.ts           # createLanguageModule / createDefaultLanguageDeps
└── README.md
```

## HTTP surface

Mounted at `{API_PREFIX}/languages`.

| Method | Path           | Permission                             |
| ------ | -------------- | -------------------------------------- |
| GET    | `/`            | public                                 |
| GET    | `/:languageId` | public                                 |
| POST   | `/`            | `language:create`                      |
| PUT    | `/:languageId` | `language:update:own` (admin elevates) |
| DELETE | `/:languageId` | `language:delete:own` (admin elevates) |

## Ownership

`ownerId` is assigned from `req.user.id` on create. Update/delete allow the
owner or an admin (`ADMIN` / `SUPER_ADMIN` via `isAdmin`).

## Persistence

Prisma model: `prisma/models/language.prisma` (client accessor:
`prisma.language`). Soft-delete uses `prismaNotDeleted` (Mongo-safe). Lists
order by `sortOrder` asc.

## Public API

```ts
import {
  createLanguageModule,
  createDefaultLanguageDeps,
  createLanguageRouter,
} from '@/modules/languages';
```
