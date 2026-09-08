# Projects module

Bilingual portfolio case studies matching frontend `IProject`.

## Endpoints

| Method | Path          | Access                                                                      |
| ------ | ------------- | --------------------------------------------------------------------------- |
| GET    | `/`           | Public (published only). `?includeUnpublished=true` requires `project:read` |
| GET    | `/:projectId` | Public (published; confidential fields redacted)                            |
| POST   | `/`           | `project:create`                                                            |
| PUT    | `/:projectId` | `project:update:own`                                                        |
| DELETE | `/:projectId` | `project:delete:own`                                                        |

## Query filters

- `isPublished`, `isFeatured`, `category`, `page`, `limit`
- `includeUnpublished` — admin list bypass (auth + permission)

## Confidential projects

When `confidential=true`, public responses omit `github`, `demo`, `resources`,
`externalLinks`, and email-like keys inside `testimonial`.
