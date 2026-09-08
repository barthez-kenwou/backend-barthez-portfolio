import type { AuditPort } from '@/shared/infrastructure/audit';

import type { BlogEntity } from '../../domain/entities/blog.entity';
import type { BlogRepositoryPort } from '../../domain/repositories/blog.repository';
import type { CreateBlogDto } from '../dto/blog.dto';
import type { BlogCachePort } from '../services/blog-cache.port';

export type CreateBlogCommandDeps = {
  blogRepository: BlogRepositoryPort;
  cache?: BlogCachePort;
  audit?: AuditPort;
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

/**
 * Creates an unpublished bilingual blog post and invalidates list caches.
 * Slug comes from the body or slugify(titleEn) + timestamp.
 */
export class CreateBlogCommand {
  constructor(private readonly deps: CreateBlogCommandDeps) {}

  async execute(input: CreateBlogDto): Promise<BlogEntity> {
    const slug = input.slug?.trim() || `${slugify(input.titleEn)}-${Date.now().toString(36)}`;

    const date = input.date instanceof Date ? input.date : new Date(input.date);

    const blog = await this.deps.blogRepository.create({
      slug,
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
      tags: input.tags ?? [],
      authorId: input.authorId,
      isPublished: input.isPublished ?? false,
    });

    await this.deps.cache?.invalidatePattern('blogs:*');

    await this.deps.audit?.record({
      actorId: input.authorId,
      action: 'blog.create',
      resource: 'blog',
      resourceId: blog.id,
    });

    return blog;
  }
}
