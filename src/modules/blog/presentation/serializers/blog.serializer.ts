import type { BlogEntity, BlogListResult } from '../../domain/entities/blog.entity';

/**
 * Maps domain blogs to the public API response shape (all bilingual fields).
 */
export const BlogSerializer = {
  one(blog: BlogEntity) {
    return {
      id: blog.id,
      slug: blog.slug,
      titleFr: blog.titleFr,
      titleEn: blog.titleEn,
      excerptFr: blog.excerptFr,
      excerptEn: blog.excerptEn,
      contentFr: blog.contentFr,
      contentEn: blog.contentEn,
      image: blog.image,
      category: blog.category,
      date: blog.date,
      readTime: blog.readTime,
      author: blog.author,
      tags: blog.tags,
      isPublished: blog.isPublished,
      views: blog.views,
      authorId: blog.authorId ?? null,
      authorUser: blog.authorUser,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    };
  },

  /** List rows omit markdown bodies — full content is loaded via GET by slug/id. */
  summary(blog: BlogEntity) {
    const full = BlogSerializer.one(blog);
    const { contentFr: _cFr, contentEn: _cEn, ...rest } = full;
    return {
      ...rest,
      contentFr: '',
      contentEn: '',
    };
  },

  list(result: BlogListResult) {
    return {
      items: result.items.map(BlogSerializer.summary),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  },
};
