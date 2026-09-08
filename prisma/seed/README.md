# Portfolio seed data

JSON payloads under `data/` are extracted from the live frontend mocks in
[`barthez-kenwou-porfolio`](https://github.com/barthez-kenwou/barthez-kenwou-porfolio):

| File                        | Source                                                                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `data/smaller-domains.json` | achievements, services, skills, experiences, education, certifications, testimonials, contactInfo, languages, references, contactResponses |
| `data/blogs.json`           | `entities/blogs/api/mock/blog.mocks.ts` (20 posts, full markdown)                                                                          |
| `data/projects.json`        | `entities/projets/api/mocks/projectData.mocks.ts` (26 case studies)                                                                        |

`npm run prisma:seed` wipes portfolio collections and re-inserts this content.
Users, RBAC, and auth tokens are left intact.
