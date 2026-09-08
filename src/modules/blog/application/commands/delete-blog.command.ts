import type { AuditPort } from '@/shared/infrastructure/audit';

import { BlogNotFoundError } from '../../domain/errors/blog.errors';
import type { BlogRepositoryPort } from '../../domain/repositories/blog.repository';
import type { DeleteBlogDto } from '../dto/blog.dto';
import type { BlogCachePort } from '../services/blog-cache.port';
import { assertBlogOwnership } from './blog-ownership';

export type DeleteBlogCommandDeps = {
  blogRepository: BlogRepositoryPort;
  cache?: BlogCachePort;
  audit?: AuditPort;
};

/**
 * Soft-deletes a blog (sets deletedAt) when the caller owns it or has :any elevation.
 */
export class DeleteBlogCommand {
  constructor(private readonly deps: DeleteBlogCommandDeps) {}

  async execute(input: DeleteBlogDto): Promise<void> {
    const blog = await this.deps.blogRepository.findById(input.id);
    if (!blog) {
      throw new BlogNotFoundError();
    }

    assertBlogOwnership(blog, input.authorId, input.isAdmin, 'delete');

    await this.deps.blogRepository.update(input.id, { deletedAt: new Date() });
    await this.deps.cache?.invalidate(`blogs:slug:${blog.slug}`);
    await this.deps.cache?.invalidatePattern('blogs:list:*');

    await this.deps.audit?.record({
      actorId: input.authorId,
      action: 'blog.delete',
      resource: 'blog',
      resourceId: input.id,
    });
  }
}
