# Newsletter module

Audience growth engine for **barthez-kenwou.dev** — double opt-in list, campaign
fan-out, and blog-triggered alerts aligned with the dark “Brilliant Obscure”
brand.

## Marketing scenarios (implemented)

| Scenario                 | Trigger                                | Behaviour                                                                                 |
| ------------------------ | -------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Subscribe (blog CTA)** | `POST /newsletter/subscribe`           | Double opt-in; opaque success (anti-enumeration); confirmation mail                       |
| **Confirm**              | `GET /newsletter/confirm?token=`       | Activates subscriber + **welcome** mail (once); redirects to `/blog?newsletter=confirmed` |
| **Welcome**              | After confirm                          | Brand intro, what they’ll get, CTA to blog                                                |
| **New article alert**    | Blog publish / create-as-published     | Teaser mail to all **active** subscribers (idempotent per `blogId`)                       |
| **Weekly digest**        | Cron `newsletter-weekly-digest`        | Posts from last 7 days → one digest campaign (no-op if empty)                             |
| **Admin broadcast**      | `POST /newsletter/campaigns/broadcast` | Custom FR/EN blast via queue                                                              |
| **Unsubscribe**          | One-click token link / POST            | Soft status + goodbye mail                                                                |
| **Admin CRM**            | List / stats / soft-delete             | Subscriber inbox for CMS                                                                  |

## Public API

- `POST /api/v1/newsletter/subscribe` `{ email, locale?, source? }`
- `GET /api/v1/newsletter/confirm?token=`
- `GET|POST /api/v1/newsletter/unsubscribe`

## Admin API (`newsletter:read|delete|broadcast`)

- `GET /api/v1/newsletter/stats`
- `GET /api/v1/newsletter/subscribers`
- `GET /api/v1/newsletter/subscribers/:id`
- `DELETE /api/v1/newsletter/subscribers/:id`
- `GET /api/v1/newsletter/campaigns`
- `POST /api/v1/newsletter/campaigns/broadcast`

## Jobs

- `heavy-tasks` → `newsletter-fanout` `{ campaignId }`
- `maintenance` → `newsletter-weekly-digest` (cron)

Frontend: wire the Blog “S’abonner” form to `POST /subscribe` with `locale` from
the language store and `source: "blog"`.
