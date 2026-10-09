import { Router } from 'express';

import {
  authenticate,
  optionalAuthenticate,
  requireActive,
  requirePermission,
  requireVerified,
} from '@/app/middleware/authenticate.middleware';
import paginationMiddleware from '@/app/middleware/pagination.middleware';
import { validationErrorHandler } from '@/app/middleware/validation-error.middleware';

import type { BlogController } from '../controllers/blog.controller';
import { blogSchemas } from '../schemas/blog.schemas';

/**
 * Blog HTTP routes — mounted at `/api/v1/blogs`.
 * Demo domain: enough validation to be credible, not a CMS.
 */
export function createBlogRoutes(controller: BlogController): Router {
  const blogs = Router();

  /** GET /search — Full-text search over published blogs (isPublished=true). */
  blogs.get(
    '/search',
    paginationMiddleware,
    blogSchemas.search,
    validationErrorHandler,
    controller.search,
  );

  /** GET / — List blog posts (paginated). Auth + includeUnpublished=true → drafts too. */
  blogs.get('/', optionalAuthenticate, paginationMiddleware, controller.list);

  /** GET /:slug — By slug or Mongo id. Auth sees drafts. */
  blogs.get(
    '/:slug',
    optionalAuthenticate,
    blogSchemas.getBySlug,
    validationErrorHandler,
    controller.getBySlug,
  );

  /** POST / — Create a blog post (`blog:create`). */
  blogs.post(
    '/',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('blog:create'),
    blogSchemas.create,
    validationErrorHandler,
    controller.create,
  );

  /** PUT /:id — Update a blog post (`blog:update:own`). */
  blogs.put(
    '/:id',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('blog:update:own'),
    blogSchemas.update,
    validationErrorHandler,
    controller.update,
  );

  /** PATCH /:id/publish — Publish a blog post (`blog:publish`). */
  blogs.patch(
    '/:id/publish',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('blog:publish'),
    blogSchemas.byId,
    validationErrorHandler,
    controller.publish,
  );

  /** DELETE /:id — Delete a blog post (`blog:delete:own`). */
  blogs.delete(
    '/:id',
    authenticate,
    requireVerified,
    requireActive,
    requirePermission('blog:delete:own'),
    blogSchemas.byId,
    validationErrorHandler,
    controller.delete,
  );

  return blogs;
}
