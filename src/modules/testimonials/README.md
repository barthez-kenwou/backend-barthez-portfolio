# Testimonials module

Public feedback + admin moderation.

## Endpoints

| Method         | Path                     | Access                                                         |
| -------------- | ------------------------ | -------------------------------------------------------------- |
| GET            | `/`                      | Public (approved/published only). Authenticated admins see all |
| POST           | `/public` or `/feedback` | Public form → `status=pending`, `source=public_form`           |
| POST           | `/`                      | Admin create (`testimonial:create`)                            |
| GET/PUT/DELETE | `/:id`                   | Admin CRUD with permissions                                    |
| PATCH          | `/:id/approve`           | `testimonial:update:any` → approved + published                |
| PATCH          | `/:id/reject`            | `testimonial:update:any` → rejected + unpublished              |
