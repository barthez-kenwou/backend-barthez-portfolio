# Contact Responses module

Inbound contact form messages matching frontend `IContactResponse`.

## Endpoints

| Method      | Path   | Access                                                     |
| ----------- | ------ | ---------------------------------------------------------- |
| POST        | `/`    | Public form → `status=new` (no auth)                       |
| GET         | `/`    | Admin list (`contact_response:read`), optional `?status=`  |
| GET         | `/:id` | Admin detail; auto-marks `new` → `read`                    |
| PATCH / PUT | `/:id` | Admin update (`contact_response:update:own` / `:any`)      |
| DELETE      | `/:id` | Admin soft-delete (`contact_response:delete:own` / `:any`) |

No `ownerId` on the Prisma model — mutations are permission-gated only.

## Status values

`new` | `read` | `archived` | `replied`
