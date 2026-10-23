# Newsletter module

Audience growth engine for **barthez-kenwou.dev** — single opt-in list, AIEC
cadence (monthly curated edition + welcome drip), aligned with the dark
“Brilliant Obscure” brand.

## Marketing scenarios (implemented)

| Scenario                 | Trigger                          | Behaviour                                                                                   |
| ------------------------ | -------------------------------- | ------------------------------------------------------------------------------------------- |
| **Subscribe (blog CTA)** | `POST /newsletter/subscribe`     | Single opt-in → `active`; welcome step 1 immediate                                          |
| **Welcome drip**         | After subscribe                  | Steps 2 (J+3) and 3 (J+8); resource = top-viewed in signup article category (`blog:{slug}`) |
| **Confirm** (legacy)     | `GET /newsletter/confirm?token=` | Activates old `pending` + welcome if needed                                                 |
| **Monthly edition**      | Admin broadcast                  | Curated AIEC note (primary cadence)                                                         |
| **Monthly digest**       | Cron `newsletter-monthly-digest` | Posts from last 30 days (no-op if empty)                                                    |
| **Blog publish alert**   | Blog publish hook                | **Off by default** (`NEWSLETTER_AUTO_BLOG_ALERT`)                                           |
| **Unsubscribe**          | One-click token                  | Soft status + goodbye mail                                                                  |
| **Admin CRM**            | List / stats / soft-delete       | Subscriber inbox for CMS                                                                    |

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
- `heavy-tasks` → `newsletter-welcome-drip` `{ subscriberId, step }` (delayed)
- `heavy-tasks` → `newsletter-monthly-digest` (cron, 1st of month by default)
- mail queue → SMTP delivery

Welcome step 1 is sent **immediately over SMTP**. Steps 2–3 and campaigns go
through BullMQ — worker + real `SMTP_*` required in production.

## Env

```env
NEWSLETTER_DIGEST_CRON=0 9 1 * *
NEWSLETTER_AUTO_BLOG_ALERT=false
```

## Production SMTP (required)

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=<brevo-login>
SMTP_PASS=<brevo-smtp-key>
USER_EMAIL=newsletter@your-verified-domain.com
MAIL_FROM_NAME=Barthez Kenwou
```

Frontend: Blog / services `NewsletterCTA` → `POST /subscribe` with `locale` and
`source` (`blog`, `blog-article`, `services`, …).
