# Newsletter module

Audience growth engine for **barthez-kenwou.dev** — single opt-in list, campaign
fan-out, and blog-triggered alerts aligned with the dark “Brilliant Obscure”
brand.

## Marketing scenarios (implemented)

| Scenario                 | Trigger                                | Behaviour                                                                   |
| ------------------------ | -------------------------------------- | --------------------------------------------------------------------------- |
| **Subscribe (blog CTA)** | `POST /newsletter/subscribe`           | Single opt-in → `active` immediately; opaque success; **welcome** mail once |
| **Confirm** (legacy)     | `GET /newsletter/confirm?token=`       | Still activates old `pending` rows + welcome if needed; redirects to blog   |
| **Welcome**              | On subscribe (or legacy confirm)       | Brand intro, what they’ll get, CTA to blog                                  |
| **New article alert**    | Blog publish / create-as-published     | Teaser mail to all **active** subscribers (idempotent per `blogId`)         |
| **Weekly digest**        | Cron `newsletter-weekly-digest`        | Posts from last 7 days → one digest campaign (no-op if empty)               |
| **Admin broadcast**      | `POST /newsletter/campaigns/broadcast` | Custom FR/EN blast via queue                                                |
| **Unsubscribe**          | One-click token link / POST            | Soft status + goodbye mail                                                  |
| **Admin CRM**            | List / stats / soft-delete             | Subscriber inbox for CMS                                                    |

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

- `heavy-tasks` → `newsletter-fanout` `{ campaignId }` (enqueues one mail job
  per subscriber)
- mail queue → SMTP delivery (worker must be running: `PROCESS_ROLE=all` or
  `worker`)
- `maintenance` → `newsletter-weekly-digest` (cron)

Welcome mail is sent **immediately over SMTP** (not only queued). Campaigns
still go through BullMQ — without a healthy `backend-worker` + real `SMTP_*`,
subscribers are saved but nobody receives anything.

## Production SMTP (required)

MailHog is **dev only**. On the VPS `.env` must use a real relay, for example
Brevo:

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=<brevo-login>
SMTP_PASS=<brevo-smtp-key>
USER_EMAIL=newsletter@your-verified-domain.com
MAIL_FROM_NAME=Barthez Kenwou
```

Rules:

1. `USER_EMAIL` must be a **verified sender** on that provider (a raw Gmail
   address often fails or lands in spam when the SMTP account is not Gmail).
2. Compose deploy runs `backend-api` + `backend-worker` — both must be up.
3. After a failed first delivery, re-submitting the same email retries welcome
   until `welcomeSentAt` is set.

Check logs for `SMTP transport verified`, `Email sent via SMTP`, or
`newsletter welcome email failed`.

Frontend: wire the Blog “S’abonner” form to `POST /subscribe` with `locale` from
the language store and `source: "blog"`.
