/**
 * Blog domain entity — no Prisma / ORM types.
 * Infrastructure maps persistence rows to and from this shape.
 */

export type BlogAuthorSummary = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
};

export type BlogEntity = {
  id: string;
  slug: string;
  titleFr: string;
  titleEn: string;
  excerptFr: string;
  excerptEn: string;
  contentFr: string;
  contentEn: string;
  image: string;
  category: string;
  date: Date;
  readTime: string;
  author: string;
  tags: string[];
  isPublished: boolean;
  views: number;
  authorId?: string | null;
  authorUser?: BlogAuthorSummary;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};

export type CreateBlogInput = {
  slug: string;
  titleFr: string;
  titleEn: string;
  excerptFr: string;
  excerptEn: string;
  contentFr: string;
  contentEn: string;
  image: string;
  category: string;
  date: Date;
  readTime: string;
  author: string;
  tags?: string[];
  authorId?: string | null;
  isPublished?: boolean;
};

export type UpdateBlogInput = Partial<{
  slug: string;
  titleFr: string;
  titleEn: string;
  excerptFr: string;
  excerptEn: string;
  contentFr: string;
  contentEn: string;
  image: string;
  category: string;
  date: Date;
  readTime: string;
  author: string;
  tags: string[];
  isPublished: boolean;
  deletedAt: Date | null;
}>;

export type BlogListResult = {
  items: BlogEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
