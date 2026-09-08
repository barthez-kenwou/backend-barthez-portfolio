# Mail templates

Transactional emails for **Barthez Kenwou** (`barthez-kenwou.dev`).

Brand kit (Pearl & Amethyst palette, logo, socials, footer) is configured via
env — see `.env.example` (`MAIL_BRAND_*`, `MAIL_SOCIAL_*`, `MAIL_FOOTER_*`) and
defaults in `src/shared/constants/mail-brand.constants.ts`.

## Layout

- `templates/*.ejs` — one file per transactional email
- `templates/partials/` — shared shell, spectrum header, footer, CTA, styles

User-facing copy uses `brandName` (default `Barthez Kenwou`), not the API
`APP_NAME`. Empty social / footer fields are omitted from the rendered HTML.
