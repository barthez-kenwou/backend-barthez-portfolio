# Testimonials module

Public feedback + admin moderation. Optional link to a portfolio project.

## Project link

- Optional `projectId` on create / public submit / update.
- Public submit only accepts a **published** project.
- On **approve** (or admin create already approved+published), the row is
  mirrored to `Project.testimonial` for the case-study tab:
  `{ quoteFr, quoteEn, author, roleFr, roleEn, company, rating, testimonialId }`.
- Reject / delete / unlink clears that JSON only when `testimonialId` matches
  (manual seed content is left alone).

## Endpoints

| Method         | Path                     | Access                                                                   |
| -------------- | ------------------------ | ------------------------------------------------------------------------ |
| GET            | `/`                      | Public (approved/published only). Optional `?projectId=`. Admins see all |
| POST           | `/public` or `/feedback` | Public form → `status=pending`, `source=public_form`                     |
| POST           | `/`                      | Admin create (`testimonial:create`)                                      |
| GET/PUT/DELETE | `/:id`                   | Admin CRUD with permissions                                              |
| PATCH          | `/:id/approve`           | `testimonial:update:any` → approved + published (+ project mirror)       |
| PATCH          | `/:id/reject`            | `testimonial:update:any` → rejected + unpublished                        |
