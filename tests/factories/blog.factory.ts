import type { BlogEntity } from '@/modules/blog/domain/entities/blog.entity';

let seq = 0;

/**
 * Builds a bilingual BlogEntity for unit tests.
 */
export const buildBlogEntity = (overrides: Partial<BlogEntity> = {}): BlogEntity => {
  seq += 1;
  const now = new Date();
  return {
    id: overrides.id ?? `blog_${seq}`,
    slug: overrides.slug ?? `post-${seq}`,
    titleFr: overrides.titleFr ?? `Article ${seq}`,
    titleEn: overrides.titleEn ?? `Post ${seq}`,
    excerptFr: overrides.excerptFr ?? 'Extrait court',
    excerptEn: overrides.excerptEn ?? 'Short excerpt',
    contentFr: overrides.contentFr ?? 'Contenu suffisamment long pour un article de démonstration.',
    contentEn: overrides.contentEn ?? 'Long enough content for a demo blog post.',
    image: overrides.image ?? 'https://cdn.example.com/cover.jpg',
    category: overrides.category ?? 'engineering',
    date: overrides.date ?? now,
    readTime: overrides.readTime ?? '5 min',
    author: overrides.author ?? 'Demo Author',
    tags: overrides.tags ?? ['demo'],
    isPublished: overrides.isPublished ?? false,
    views: overrides.views ?? 0,
    authorId: overrides.authorId === undefined ? 'user_0001' : overrides.authorId,
    authorUser: overrides.authorUser,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    deletedAt: overrides.deletedAt ?? null,
  };
};
