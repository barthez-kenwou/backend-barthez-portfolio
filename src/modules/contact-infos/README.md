# Contact Infos module

Singleton public contact / profile info matching frontend `IContactInfo`.

## Endpoints

| Method | Path | Access                                                                |
| ------ | ---- | --------------------------------------------------------------------- |
| GET    | `/`  | Public singleton (`?key=` optional, default `"default"`)              |
| PUT    | `/`  | Admin upsert (`contact_info:update:own` / `:any`) — create if missing |
| DELETE | `/`  | Admin soft-delete (`contact_info:delete:own` / `:any`)                |

There is no public list or public create. `ownerId` is not on the Prisma model.

## Soft-delete

Reads use `prismaNotDeleted`. Upsert clears `deletedAt` so a soft-deleted key
can be restored.
