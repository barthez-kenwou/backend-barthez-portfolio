# Portfolio seed data

JSON payloads under `data/` are extracted from the live frontend mocks in
[`barthez-kenwou-porfolio`](https://github.com/barthez-kenwou/barthez-kenwou-porfolio):

| File                        | Source                                                                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `data/smaller-domains.json` | achievements, services, skills, experiences, education, certifications, testimonials, contactInfo, languages, references, contactResponses |
| `data/blogs.json`           | `entities/blogs/api/mock/blog.mocks.ts` (20 posts, full markdown)                                                                          |
| `data/projects.json`        | `entities/projets/api/mocks/projectData.mocks.ts` (26 case studies)                                                                        |

## Commands

| Context               | Command                                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| Local / staging       | `npm run prisma:seed`                                                                                       |
| Production (one-shot) | `CONFIRM_PROD_SEED=yes` + compose profile `seed` — see [production.md](../../docs/deployment/production.md) |

Logic lives in `src/scripts/seed/portfolio-content.ts` (compiled into the
image). Both entrypoints **wipe** portfolio CMS collections then re-insert this
content. Users, RBAC, and auth tokens are left intact.

In `NODE_ENV=production`, the wipe step is refused unless
`CONFIRM_PROD_SEED=yes`. Do **not** run this from CD / every deploy — only for
an empty (or intentionally reset) production DB.
