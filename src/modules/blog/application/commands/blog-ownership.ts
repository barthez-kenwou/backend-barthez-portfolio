import type { BlogEntity } from '../../domain/entities/blog.entity';
import { BlogForbiddenError } from '../../domain/errors/blog.errors';

/**
 * Ownership gate for optional authorId:
 * - authorId set → actor must match (unless elevated with :any)
 * - authorId null → only :any (isAdmin) may mutate
 */
export function assertBlogOwnership(
  blog: BlogEntity,
  actorId: string,
  isAdmin: boolean,
  action: 'update' | 'publish' | 'delete',
): void {
  if (isAdmin) {
    return;
  }

  if (blog.authorId && blog.authorId === actorId) {
    return;
  }

  if (!blog.authorId) {
    throw new BlogForbiddenError(`Only elevated actors can ${action} blogs without an owner`);
  }

  throw new BlogForbiddenError(`You can only ${action} your own blogs`);
}
