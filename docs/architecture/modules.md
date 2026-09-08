# Modules Catalog

Each entry under `src/modules/` is a bounded context. Public entry points are
the module `index.ts` exports and (when present) the HTTP router mounted from
`src/app/routes/index.ts`.

## Shared module layout

```
module-name/
├── domain/
├── application/
├── infrastructure/
├── presentation/     # optional for non-HTTP modules
├── index.ts
└── README.md
```

---

# Platform modules

## auth

**Purpose.** Signup, OTP verification, optional TOTP, login, `/me`, sessions,
refresh-token rotation, logout, forgot/reset/change password.

**Public entry points.**

```ts
import {
  createAuthModule,
  createDefaultAuthDeps,
  createAuthRouter,
} from '@/modules/auth';
```

Mounted at: `{API_PREFIX}/auth`.

| Method | Path                   | Notes                                    |
| ------ | ---------------------- | ---------------------------------------- |
| POST   | `/signup`              | Multipart avatar; idempotency optional   |
| POST   | `/verify`              | Email OTP                                |
| POST   | `/resend-otp`          |                                          |
| POST   | `/login`               | `totpCode` required when TOTP is enabled |
| POST   | `/refresh`             | Cookie or JSON body                      |
| POST   | `/forgot-password`     |                                          |
| POST   | `/reset-password`      | Opaque Redis token                       |
| POST   | `/logout`              | Auth                                     |
| POST   | `/change-password`     | Auth; revokes all sessions               |
| GET    | `/me`                  | Auth                                     |
| GET    | `/sessions`            | Auth                                     |
| DELETE | `/sessions/:familyId`  | Auth                                     |
| POST   | `/totp/enroll`         | Auth; otpauth URL + secret once          |
| POST   | `/totp/confirm`        | Auth                                     |
| POST   | `/totp/disable`        | Auth; password + current code            |
| POST   | `/totp/recovery-codes` | Auth; generates one-time recovery codes  |
| POST   | `/totp/recover`        | Login path with recovery code            |

**Key use cases.** `SignupCommand`, `VerifyOtpCommand`, `ResendOtpCommand`,
`LoginCommand`, `GetCurrentUserQuery`, session list/revoke, TOTP
enroll/confirm/disable, `RefreshTokenCommand`, `LogoutCommand`,
`ForgotPasswordCommand`, `ResetPasswordCommand`, `ChangePasswordCommand`.

**How to extend.**

- Swap `TokenServicePort` (JWT algorithm / key source).
- Replace `UserRepositoryPort` / `TokenRepositoryPort` (Prisma → another store).
- Override `MailerPort`, `RbacPort`, `AvatarUploaderPort`, `UserCachePort` via
  `createDefaultAuthDeps({ ... })`.
- TOTP secrets use `AUTH_ENCRYPTION_KEY` (AES-256-GCM).

See [Authentication guide](../guides/authentication.md).

---

## users

**Purpose.** Self-service profile + admin user management: list/search/export,
invite, activate/deactivate, verify, unlock, force-logout, soft/hard delete,
restore, role assignment.

**Public entry points.**

```ts
import {
  createUsersModule,
  createDefaultUsersDeps,
  createUsersRouter,
} from '@/modules/users';
```

Mounted at: `{API_PREFIX}/users`.

**Boundary.** Own snapshot with roles = `GET /auth/me` (auth module). Password,
OTP, TOTP, and session families stay in auth; users calls a `SessionPort` for
revoke-all / invite reset tokens.

**Caps.** List `limit` max 100. Search `limit` max 50 (paginated). Sync export
max **2000** rows (`X-Export-Truncated` when capped; async MinIO export is a
follow-up). Assignable roles: `admin`, `user`, `guest`.

Full HTTP table: [users module README](../../src/modules/users/README.md).

**GDPR hard-delete** (`DELETE /:userId/permanent`): anonymize PII, tombstone
blogs, drop the user row only when no blogs remain.

**How to extend.**

- Implement `UsersRepositoryPort` for an alternate persistence layer.
- Reuse the auth `User` entity — do not duplicate user identity models.
- Role changes go through `RbacPort`; session revoke through `SessionPort`.

See `src/modules/users/README.md`.

---

## rbac

**Purpose.** Roles, permissions, ACL resolution, system role seeding, and role
assignment used by auth (default role on signup) and users (admin role updates).

**Public entry points.**

```ts
import {
  createRbacModule,
  createDefaultRbacDeps,
  rbacService,
} from '@/modules/rbac';
```

No dedicated public REST router. HTTP role assignment lives on the users module
(`PUT /:userId/role`). Bootstrap seeding runs in `bootstrapApplication()` via
`rbacService.seedSystemRolesAndPermissions()`.

Seeded slugs: `super-admin`, `admin`, `user`, `guest`. Catalogue includes
`audit:read` (admin + super-admin) and portfolio domain permissions
(`project:*`, `blog:*`, `contact_response:*`, etc.). `SYSTEM_PERMISSIONS` lives
in `src/shared/constants/app.constants.ts`.

**How to extend.**

- Swap `RbacRepositoryPort`.
- Add permissions in Prisma RBAC models and seed logic; keep middlewares
  consuming the rbac facade or injected use cases.

---

## oauth

**Purpose.** Social login and account linking for Google, GitHub, Facebook,
LinkedIn, Twitter, Instagram, plus Telegram widget auth.

Gated by Flagsmith `enable_oauth` (default **true**). When off, authorize,
callback, Telegram, and unlink fail closed (`OAuthFeatureDisabledError`).

**Public entry points.**

```ts
import {
  createOAuthModule,
  createDefaultOAuthDeps,
  createOAuthRouter,
} from '@/modules/oauth';
```

Mounted at: `{API_PREFIX}/auth/oauth`.

| Method | Path                  | Notes                                |
| ------ | --------------------- | ------------------------------------ |
| GET    | `/accounts`           | Authenticated — list linked accounts |
| POST   | `/telegram`           | Public — Telegram widget             |
| GET    | `/:provider`          | Redirect to provider                 |
| GET    | `/:provider/callback` | OAuth callback                       |
| DELETE | `/:provider/unlink`   | Authenticated                        |

**How to extend.** See
[Adding an OAuth provider](../guides/adding-oauth-provider.md).

---

## files

**Purpose.** Validated user uploads (avatars, documents) with ClamAV scanning
(fail-open unless `CLAMAV_REQUIRED=true`) and presigned large-object I/O.
Distinct from shared object storage used for backups and raw put/get.

**Public entry points.**

```ts
import {
  createFilesModule,
  createDefaultFilesDeps,
  createFilesRouter,
  uploadAvatar,
  uploadFile,
  upload, // multer middleware
} from '@/modules/files';
```

Mounted at: `{API_PREFIX}/files`.

| Method | Path       | Notes                                              |
| ------ | ---------- | -------------------------------------------------- |
| POST   | `/presign` | Authenticated PUT URL (`PRESIGN_UPLOAD_MAX_BYTES`) |
| GET    | `/presign` | Authenticated GET URL (`key` query)                |

Avatars remain **multipart** on auth signup and users profile
(`upload.single('profile')`), capped at `API_UPLOAD_MAX_BYTES` (2MB). Magic-byte
sniff (`file-type`); `avatar` profile allows jpeg/png; default allows
jpeg/png/pdf.

ClamAV is injected on the singleton uploader in `infrastructure/config/minio.ts`
(skipped in tests).

**How to extend.**

- Implement `UploaderPort` / `ScannerPort`.
- For backups and bucket bootstrap, use `@/shared/infrastructure/storage` and
  `STORAGE_PROVIDER` (see [Storage providers](../guides/storage-providers.md)).

---

## backup

**Purpose.** MongoDB dump → streaming AES-256-GCM encryption (random salt) →
object storage upload, with admin notification mail. Invoked by the BullMQ
`BACKUP` worker.

Registered when `PROCESS_ROLE` is `all` or `worker` and Flagsmith
`enable_backup` is on (default true). `BACKUP_ENCRYPTION_KEY` is required for a
useful dump.

**Public entry points.**

```ts
import {
  runMongoBackup,
  createBackupModule,
  createDefaultBackupDeps,
} from '@/modules/backup';
```

Wired from `src/shared/infrastructure/queue/workers.ts`.

**How to extend.** Swap `MongoBackupProvider`; keep mail templates
`db-notification-success` / `db-notification-error` in shared mail templates.
See [Backups](../guides/backup.md).

---

## notifications

**Purpose.** Thin facade over shared mail infrastructure for transactional /
templated email. Templates live in `src/shared/infrastructure/mail/templates/` —
do not duplicate EJS files inside the module.

**Public entry points.**

```ts
import {
  sendTemplatedMail,
  queueMail,
  createNotificationsModule,
} from '@/modules/notifications';
```

**How to extend.** Change SMTP or queue adapters under
`@/shared/infrastructure/mail`. Add presentation later only if you need an admin
“send test email” endpoint.

---

## system

**Purpose.** Operational HTTP surfaces: health (live/ready), CSRF token, CSP
report, Prometheus metrics, Bull Board, audit investigation (list / detail /
export), and admin dashboard counts for the CMS.

**Public entry points.**

```ts
import { createSystemRouters } from '@/modules/system';

const system = createSystemRouters();
// system.health | .csrf | .csp | .metrics | .audit | .dashboard | .setupBullBoard(app)
```

| Mount                                | Auth                                    |
| ------------------------------------ | --------------------------------------- |
| `/health`, `/live`, `/ready`         | none                                    |
| `/metrics`                           | HTTP Basic (except tests)               |
| `/csrf-token`                        | none                                    |
| CSP report URI                       | none                                    |
| `/admin/queues`                      | Basic + JWT + `isAdmin`                 |
| `{API_PREFIX}/admin/audit`           | JWT + `audit:read` — list               |
| `{API_PREFIX}/admin/audit/export`    | JWT + `audit:read` — CSV/JSON           |
| `{API_PREFIX}/admin/audit/{auditId}` | JWT + `audit:read` — detail             |
| `{API_PREFIX}/admin/dashboard`       | JWT + admin/super-admin or `audit:read` |

Dashboard returns counts: `publishedProjects`, `publishedBlogs`,
`newContactResponses`, `pendingTestimonials`.

**How to extend.** Add ops routes under `presentation/routes` and expose them
from `createSystemRouters`.

---

# Portfolio content modules

These modules power https://barthez-kenwou.dev and the `/barthez-admin` CMS.
Most list/get endpoints are public; mutations require verified bearer + domain
permissions.

## blog

**Purpose.** Bilingual (FR/EN) portfolio blog posts: create, update, publish
(`isPublished`), soft-delete, public listing and search.

**Public entry points.**

```ts
import {
  createBlogModule,
  createDefaultBlogDeps,
  createBlogRouter,
} from '@/modules/blog';
```

Mounted at: `{API_PREFIX}/blogs`.

| Method | Path           | Auth              |
| ------ | -------------- | ----------------- |
| GET    | `/search`      | Public            |
| GET    | `/`            | Public            |
| GET    | `/:slug`       | Public            |
| POST   | `/`            | `blog:create`     |
| PUT    | `/:id`         | `blog:update:own` |
| PATCH  | `/:id/publish` | `blog:publish`    |
| DELETE | `/:id`         | `blog:delete:own` |

Fields include `titleFr`/`titleEn`, `excerptFr`/`excerptEn`,
`contentFr`/`contentEn`, `image`, `category`, `date`, `readTime`, `author`,
`tags`, and `isPublished`.

---

## projects

**Purpose.** Portfolio case studies with bilingual copy, featured / published /
confidential flags. Public lists default to published; `includeUnpublished=true`
requires `project:read`. Confidential projects redact sensitive links on public
reads.

Mounted at: `{API_PREFIX}/projects`.

| Method | Path          | Auth / notes                                    |
| ------ | ------------- | ----------------------------------------------- |
| GET    | `/`           | Public (published); `includeUnpublished` → auth |
| GET    | `/:projectId` | Public (confidential fields redacted)           |
| POST   | `/`           | `project:create`                                |
| PUT    | `/:projectId` | `project:update:own`                            |
| DELETE | `/:projectId` | `project:delete:own`                            |

---

## services

**Purpose.** Offered services with bilingual titles/descriptions, feature lists,
and EUR pricing (`priceEur` is source of truth).

Mounted at: `{API_PREFIX}/services`. Public GET list/detail; admin mutations.

---

## skills

**Purpose.** Skill matrix (`name`, `category`, `level` 0–100, `icon`,
`sortOrder`) for the Skills page and CV aggregate.

Mounted at: `{API_PREFIX}/skills`. Public GET; admin mutations.

---

## experiences

**Purpose.** Professional experience entries (bilingual titles/companies, bullet
descriptions, period) for About / CV.

Mounted at: `{API_PREFIX}/experiences`. Public GET; admin mutations.

---

## education

**Purpose.** Education entries (`degreeFr`/`degreeEn`, school, period, optional
link) for the CV.

Mounted at: `{API_PREFIX}/education`. Public GET; admin mutations.

---

## certifications

**Purpose.** Certifications (`name`, `issuer`, `year`, optional `link`) for
Skills and CV.

Mounted at: `{API_PREFIX}/certifications`. Public GET; admin mutations.

---

## testimonials

**Purpose.** Public testimonials with moderation. Visitors submit via
`POST /public` or `POST /feedback` (pending). Admins approve/reject and manage
publish status.

Mounted at: `{API_PREFIX}/testimonials`.

| Method | Path                      | Auth / notes                    |
| ------ | ------------------------- | ------------------------------- |
| GET    | `/`                       | Public approved; admins see all |
| POST   | `/public`, `/feedback`    | Public form                     |
| POST   | `/`                       | `testimonial:create`            |
| GET    | `/:testimonialId`         | `testimonial:read`              |
| PUT    | `/:testimonialId`         | `testimonial:update:own`        |
| PATCH  | `/:testimonialId/approve` | `testimonial:update:any`        |
| PATCH  | `/:testimonialId/reject`  | `testimonial:update:any`        |
| DELETE | `/:testimonialId`         | `testimonial:delete:own`        |

---

## achievements

**Purpose.** Highlight counters (`iconKey`, `value`, bilingual labels) shown on
the Skills page.

Mounted at: `{API_PREFIX}/achievements`. Public GET; admin mutations.

---

## references

**Purpose.** Professional references (PII: name, role, company, email, phone).
Direct list/get require `reference:read`. Also included in the public CV
aggregate.

Mounted at: `{API_PREFIX}/references`. Auth required for all routes.

---

## languages

**Purpose.** Spoken languages (`language`, `proficiencyFr`/`proficiencyEn`) for
the CV.

Mounted at: `{API_PREFIX}/languages`. Public GET; admin mutations.

---

## contact-infos

**Purpose.** Singleton public profile / contact card (`singletonKey`, default
`"default"`).

Mounted at: `{API_PREFIX}/contact-infos`.

| Method | Path | Auth                      |
| ------ | ---- | ------------------------- |
| GET    | `/`  | Public (`?key=` optional) |
| PUT    | `/`  | `contact_info:update:own` |
| DELETE | `/`  | `contact_info:delete:own` |

---

## contact-responses

**Purpose.** Inbound contact-form messages. Public submit; admin inbox for
list/detail/status/notes.

Mounted at: `{API_PREFIX}/contact-responses`.

| Method      | Path                  | Auth                                 |
| ----------- | --------------------- | ------------------------------------ |
| POST        | `/`                   | Public                               |
| GET         | `/`                   | `contact_response:read`              |
| GET         | `/:contactResponseId` | `contact_response:read` (marks read) |
| PATCH / PUT | `/:contactResponseId` | `contact_response:update:own`        |
| DELETE      | `/:contactResponseId` | `contact_response:delete:own`        |

Statuses: `new`, `read`, `archived`, `replied`.

---

## cv

**Purpose.** Read-only public aggregate for the resume page / PDF: contact info,
experiences, education, skills, featured published projects (confidential links
redacted), certifications, languages, and references.

**Public entry points.**

```ts
import { createCvModule, createDefaultCvDeps, createCvRouter } from '@/modules/cv';
```

Mounted at: `{API_PREFIX}/cv`.

| Method | Path | Auth   |
| ------ | ---- | ------ |
| GET    | `/`  | Public |

Loads soft-delete-aware Prisma aggregates (does not go through every domain
module’s use cases).

---

## Wiring checklist (all modules)

1. Export `createXxxModule` + `createDefaultXxxDeps` from `index.ts`.
2. Register in `src/app/container/index.ts` when the module participates in the
   HTTP graph (or call use cases from workers for background-only modules).
3. Mount routers in `src/app/routes/index.ts` when HTTP is required.
4. Keep the module `README.md` and this catalog in sync.
5. Prefer overriding ports in tests via `createContainer({ ... })` /
   `createDefaultXxxDeps({ ... })`.
