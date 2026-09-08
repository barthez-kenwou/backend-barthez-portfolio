import type { Blog as PrismaBlog, User } from '@prisma/client';

import type { BlogAuthorSummary, BlogEntity } from '../../domain/entities/blog.entity';

type PrismaBlogWithAuthor = PrismaBlog & {
  authorUser?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'> | null;
};

/**
 * Maps Prisma Blog rows ↔ domain BlogEntity.
 */
export const BlogMapper = {
  toDomain(row: PrismaBlogWithAuthor): BlogEntity {
    const authorUser: BlogAuthorSummary | undefined = row.authorUser
      ? {
          id: row.authorUser.id,
          firstName: row.authorUser.firstName,
          lastName: row.authorUser.lastName,
          avatarUrl: row.authorUser.avatarUrl,
        }
      : undefined;

    return {
      id: row.id,
      slug: row.slug,
      titleFr: row.titleFr,
      titleEn: row.titleEn,
      excerptFr: row.excerptFr,
      excerptEn: row.excerptEn,
      contentFr: row.contentFr,
      contentEn: row.contentEn,
      image: row.image,
      category: row.category,
      date: row.date,
      readTime: row.readTime,
      author: row.author,
      tags: row.tags ?? [],
      isPublished: row.isPublished,
      views: row.views,
      authorId: row.authorId,
      authorUser,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    };
  },
};
