# Prisma

MongoDB models for the Barthez Kenwou Portfolio Backend
([barthez-kenwou.dev](https://barthez-kenwou.dev)). Prisma does **not** run SQL
migrations against Mongo — use `db push` (and `prisma generate`) in development.

```text
prisma/
├── schema.prisma          # generator + datasource only
├── models/
│   ├── user.prisma        # User + OTP embed; totpSecret / totpEnabled
│   ├── auth.prisma        # RefreshToken, blacklist
│   ├── oauth.prisma       # OAuthAccount
│   ├── rbac.prisma        # Role, Permission, UserRole, RolePermission
│   ├── audit.prisma       # AuditLog indexes
│   ├── blog.prisma        # Bilingual portfolio posts; author has no onDelete cascade
│   ├── project.prisma     # Case studies (featured / published / confidential)
│   ├── service.prisma     # Offered services + EUR pricing
│   ├── skill.prisma       # Skill matrix
│   ├── experience.prisma  # Professional experiences
│   ├── education.prisma   # Education entries
│   ├── certification.prisma
│   ├── testimonial.prisma # Public feedback + moderation status
│   ├── achievement.prisma # Highlight counters
│   ├── reference.prisma   # Professional references (PII)
│   ├── language.prisma    # Spoken languages
│   ├── contact-info.prisma    # Singleton profile / contact card
│   └── contact-response.prisma # Contact-form inbox
├── seed.ts                # RBAC + portfolio content from frontend mocks
├── seed/
│   ├── portfolio-content.ts
│   ├── README.md
│   └── data/              # blogs.json, projects.json, smaller-domains.json
└── README.md
```

## Commands

```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run prisma:studio      # localhost:5555, dev only
```

`prisma:seed` loads:

1. System RBAC roles and permissions (including portfolio domain permissions)
2. Full portfolio CMS content from frontend mocks (skills, projects, blogs,
   services, experiences, education, certifications, testimonials, achievements,
   languages, references, contact info, demo contact responses)

Re-running the seed **replaces** portfolio collections; users and auth tokens
are preserved. Application bootstrap also re-seeds RBAC at process start
(skipped in tests).

## TOTP

`User.totpSecret` is AES-256-GCM ciphertext (`AUTH_ENCRYPTION_KEY`).
`totpEnabled` gates login (`TOTP_REQUIRED`).

## Hard-delete vs blogs

`Blog.author` references `User` **without** cascade. GDPR hard-delete anonymizes
PII first; if blogs remain, the user row is kept as a stub so posts stay valid.
See `prisma-users.repository.ts`.

## Soft delete

Portfolio content models use soft-delete (`deletedAt` / related helpers). The
public CV aggregate and list queries filter soft-deleted rows.

## Indexes — never silent-push to production

Indexes live in `prisma/models/*.prisma` (`@@index`, `@@unique`). They are
applied via `prisma db push`, not via SQL migrations.

Checklist before production sync:

1. Review the model diff for new/changed indexes.
2. Estimate collection size / write load.
3. Apply in staging first; confirm query plans.
4. Schedule production sync; watch index builds (Atlas or `currentOp`).
5. Document rollback (drop unused indexes) if the code change is reverted.

Do **not** run an unattended `db push` as part of a blind production deploy.
Full guidance: [MongoDB indexes](../docs/guides/mongodb-indexes.md).

## Atlas Search

Users/blog free-text search defaults to Prisma `contains` (hard-capped). For
production relevance ranking, implement Atlas Search (or another engine) behind
`SearchPort` — see the same guide.
