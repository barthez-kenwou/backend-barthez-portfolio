# Partners module

Organizations that trusted a collaboration — homepage logo strip (“Ils m’ont
fait confiance”).

## Domain fields

- `name`, `logoUrl` (required)
- `websiteUrl`, `descriptionFr/En`, `relationFr/En` (optional)
- `isPublished` (default true)
- `sortOrder`, `ownerId`, timestamps + soft-delete

## HTTP surface

Mounted at `{API_PREFIX}/partners`.

| Method | Path          | Auth / permission                     |
| ------ | ------------- | ------------------------------------- |
| GET    | `/`           | Public (published by default)         |
| GET    | `/:partnerId` | Public                                |
| POST   | `/`           | `partner:create`                      |
| PUT    | `/:partnerId` | `partner:update:own` (admin elevates) |
| DELETE | `/:partnerId` | `partner:delete:own` (admin elevates) |

Query on list: `page`, `limit`, `isPublished`, `includeUnpublished` (admin
inventory).

## Persistence

Prisma model: `prisma/models/partner.prisma` → `prisma.partner`.
