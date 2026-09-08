# Blog module

Reference domain: create, update, publish, soft-delete, public listing and
search. Replace this module with your product domain when forking.

## Layout

```
blog/
├── domain/            # Blog entity, repository port, domain errors
├── application/       # Commands / queries + cache / RBAC ports
├── infrastructure/    # Prisma repo, mapper
├── presentation/      # Thin Express controllers, routes, validators, serializers
├── index.ts           # createBlogModule / createBlogRouter
└── README.md
```

## HTTP (mounted at `{API_PREFIX}/blogs`)

| Method | Path           | Auth              |
| ------ | -------------- | ----------------- |
| GET    | `/search`      | Public            |
| GET    | `/`            | Public            |
| GET    | `/:slug`       | Public            |
| POST   | `/`            | `blog:create`     |
| PUT    | `/:id`         | `blog:update:own` |
| PATCH  | `/:id/publish` | `blog:publish`    |
| DELETE | `/:id`         | `blog:delete:own` |

`authorId` is optional. When set, ownership checks require the actor to match
(or hold `:any`). When null, only `:any` elevation may mutate. Display `author`
is a free-form string. Publish sets `isPublished=true` (no CMS status enums).

## Dependency rules

| Layer          | May depend on                  | Must not import        |
| -------------- | ------------------------------ | ---------------------- |
| Domain         | shared domain (`AppError`)     | Express, Prisma, Redis |
| Application    | Domain ports + DTOs            | Express, Prisma        |
| Infrastructure | Domain ports (implements them) | Presentation           |
| Presentation   | Application use cases          | Prisma directly        |

## Public API

```ts
import { createBlogRouter, createBlogModule, createDefaultBlogDeps } from '@/modules/blog';

const blog = createBlogModule(
  createDefaultBlogDeps({
    cache: undefined, // skip caching in tests
  }),
);
```

## Extension points

1. **BlogRepositoryPort** — replace Prisma with another store.
2. **BlogCachePort** — swap Redis/local cache or disable for tests.
3. **BlogRbacPort** — point at `@/modules/rbac`.
