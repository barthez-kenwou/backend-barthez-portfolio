import type { AuditPort } from '@/shared/infrastructure/audit';

import type { BlogEntity } from '../../domain/entities/blog.entity';
import { BlogNotFoundError } from '../../domain/errors/blog.errors';
import type { BlogRepositoryPort } from '../../domain/repositories/blog.repository';
import type { PublishBlogDto } from '../dto/blog.dto';
import type { BlogCachePort } from '../services/blog-cache.port';
import type { BlogPublishedNotifyPort } from '../services/blog-published-notify.port';
import { assertBlogOwnership } from './blog-ownership';

export type PublishBlogCommandDeps = {
  blogRepository: BlogRepositoryPort;
  cache?: BlogCachePort;
  audit?: AuditPort;
  newsletter?: BlogPublishedNotifyPort;
};

/**
 * Sets isPublished=true when the actor owns the post or holds :any elevation.
 */
export class PublishBlogCommand {
  constructor(private readonly deps: PublishBlogCommandDeps) {}

  async execute(input: PublishBlogDto): Promise<BlogEntity> {
    const blog = await this.deps.blogRepository.findById(input.id);
    if (!blog) {
      throw new BlogNotFoundError();
    }

    assertBlogOwnership(blog, input.authorId, input.isAdmin, 'publish');

    const alreadyPublished = blog.isPublished;

    const updated = await this.deps.blogRepository.update(input.id, {
      isPublished: true,
    });

    await this.deps.cache?.invalidate(`blogs:slug:${blog.slug}`);
    await this.deps.cache?.invalidatePattern('blogs:list:*');

    await this.deps.audit?.record({
      actorId: input.authorId,
      action: 'blog.publish',
      resource: 'blog',
      resourceId: input.id,
    });

    if (!alreadyPublished) {
      await this.deps.newsletter?.onBlogPublished(updated);
    }

    return updated;
  }
}
