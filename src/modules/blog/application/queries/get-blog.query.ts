import { CacheTTL } from '@/shared/infrastructure/cache';

import type { BlogEntity } from '../../domain/entities/blog.entity';
import { BlogNotFoundError } from '../../domain/errors/blog.errors';
import type { BlogRepositoryPort } from '../../domain/repositories/blog.repository';
import type { GetBlogBySlugDto } from '../dto/blog.dto';
import type { BlogCachePort } from '../services/blog-cache.port';

export type GetBlogQueryDeps = {
  blogRepository: BlogRepositoryPort;
  cache?: BlogCachePort;
};

/**
 * Loads a blog by slug, or by Mongo ObjectId when the path segment looks like an id.
 * Public callers only see published posts; admin passes includeUnpublished.
 */
export class GetBlogQuery {
  constructor(private readonly deps: GetBlogQueryDeps) {}

  async execute(input: GetBlogBySlugDto): Promise<BlogEntity> {
    const key = input.slug;
    const includeUnpublished = Boolean(input.includeUnpublished);
    const isMongoId = /^[a-f\d]{24}$/i.test(key);

    if (isMongoId) {
      const byId = await this.deps.blogRepository.findById(key);
      if (!byId || (!includeUnpublished && !byId.isPublished)) {
        throw new BlogNotFoundError();
      }
      return byId;
    }

    const cacheKey = includeUnpublished ? `blogs:slug:any:${key}` : `blogs:slug:${key}`;

    const loader = async (): Promise<BlogEntity> => {
      const blog = includeUnpublished
        ? await this.deps.blogRepository.findBySlug(key)
        : await this.deps.blogRepository.findPublicBySlug(key);
      if (!blog) {
        throw new BlogNotFoundError();
      }
      return blog;
    };

    if (!this.deps.cache || includeUnpublished) {
      return loader();
    }

    return this.deps.cache.getOrSet(cacheKey, loader, CacheTTL.MEDIUM);
  }
}
