import type { AuditPort } from '@/shared/infrastructure/audit';

import type { BlogEntity } from '../../domain/entities/blog.entity';
import { BlogNotFoundError } from '../../domain/errors/blog.errors';
import type { BlogRepositoryPort } from '../../domain/repositories/blog.repository';
import type { UpdateBlogDto } from '../dto/blog.dto';
import type { BlogCachePort } from '../services/blog-cache.port';
import { assertBlogOwnership } from './blog-ownership';

export type UpdateBlogCommandDeps = {
  blogRepository: BlogRepositoryPort;
  cache?: BlogCachePort;
  audit?: AuditPort;
};

/**
 * Updates bilingual blog fields when the caller owns the post or has :any elevation.
 */
export class UpdateBlogCommand {
  constructor(private readonly deps: UpdateBlogCommandDeps) {}

  async execute(input: UpdateBlogDto): Promise<BlogEntity> {
    const blog = await this.deps.blogRepository.findById(input.id);
    if (!blog) {
      throw new BlogNotFoundError();
    }

    assertBlogOwnership(blog, input.authorId, input.isAdmin, 'update');

    const date =
      input.date === undefined
        ? undefined
        : input.date instanceof Date
          ? input.date
          : new Date(input.date);

    const updated = await this.deps.blogRepository.update(input.id, {
      slug: input.slug,
      titleFr: input.titleFr,
      titleEn: input.titleEn,
      excerptFr: input.excerptFr,
      excerptEn: input.excerptEn,
      contentFr: input.contentFr,
      contentEn: input.contentEn,
      image: input.image,
      category: input.category,
      date,
      readTime: input.readTime,
      author: input.author,
      tags: input.tags,
      isPublished: input.isPublished,
    });

    await this.deps.cache?.invalidate(`blogs:slug:${blog.slug}`);
    await this.deps.cache?.invalidatePattern('blogs:list:*');

    await this.deps.audit?.record({
      actorId: input.authorId,
      action: 'blog.update',
      resource: 'blog',
      resourceId: input.id,
    });

    return updated;
  }
}
