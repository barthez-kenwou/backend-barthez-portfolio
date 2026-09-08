# CV module

Thin public aggregate that assembles a portfolio CV in one response. Loads
ContactInfo, experiences, education, skills, featured projects, certifications,
languages, and references directly via Prisma (soft-delete aware). Other domain
modules may still be stubs with mismatched fields — this module intentionally
bypasses them.

## Layout

```
cv/
├── application/       # GetCvQuery (Prisma aggregate)
├── presentation/      # Controller, routes, serializer
├── index.ts           # createCvModule / createCvRouter
└── README.md
```

## HTTP (mounted at `{API_PREFIX}/cv`)

| Method | Path | Auth   |
| ------ | ---- | ------ |
| GET    | `/`  | Public |

## Public API

```ts
import { createCvRouter, createCvModule, createDefaultCvDeps } from '@/modules/cv';

const cv = createCvModule(createDefaultCvDeps());
```

## Notes

- Featured projects: `isPublished=true` and `isFeatured=true`.
- Ordered collections use `sortOrder` ascending where applicable.
- ContactInfo is resolved by `singletonKey: "default"`.
