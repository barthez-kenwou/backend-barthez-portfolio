import { prismaNotDeleted } from '@/shared/infrastructure/database/prisma-soft-delete';
import prisma from '@/shared/infrastructure/database/prisma.client';

import type {
  BlogEntity,
  BlogListResult,
  CreateBlogInput,
  UpdateBlogInput,
} from '../../domain/entities/blog.entity';
import type { BlogRepositoryPort } from '../../domain/repositories/blog.repository';
import { BlogMapper } from '../persistence/blog.mapper';

const authorUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
} as const;

/**
 * Prisma-backed BlogRepositoryPort.
 * Soft-deleted blogs are excluded via prismaNotDeleted (Mongo unset-safe).
 * Public surfaces require isPublished=true.
 */
export class PrismaBlogRepository implements BlogRepositoryPort {
  async create(data: CreateBlogInput): Promise<BlogEntity> {
    const blog = await prisma.blog.create({
      data: {
        slug: data.slug,
        titleFr: data.titleFr,
        titleEn: data.titleEn,
        excerptFr: data.excerptFr,
        excerptEn: data.excerptEn,
        contentFr: data.contentFr,
        contentEn: data.contentEn,
        image: data.image,
        category: data.category,
        date: data.date,
        readTime: data.readTime,
        author: data.author,
        tags: data.tags ?? [],
        authorId: data.authorId ?? null,
        isPublished: data.isPublished ?? false,
        deletedAt: null,
      },
      include: { authorUser: { select: authorUserSelect } },
    });
    return BlogMapper.toDomain(blog);
  }

  async findById(id: string): Promise<BlogEntity | null> {
    const blog = await prisma.blog.findFirst({
      where: { id, ...prismaNotDeleted },
      include: { authorUser: { select: authorUserSelect } },
    });
    return blog ? BlogMapper.toDomain(blog) : null;
  }

  async findPublicBySlug(slug: string): Promise<BlogEntity | null> {
    const blog = await prisma.blog.findFirst({
      where: {
        slug,
        isPublished: true,
        ...prismaNotDeleted,
      },
      include: { authorUser: { select: authorUserSelect } },
    });
    return blog ? BlogMapper.toDomain(blog) : null;
  }

  async listPublic(page: number, limit: number): Promise<BlogListResult> {
    const skip = (page - 1) * limit;
    const where = {
      isPublished: true,
      ...prismaNotDeleted,
    };

    const [items, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: { authorUser: { select: authorUserSelect } },
      }),
      prisma.blog.count({ where }),
    ]);

    return {
      items: items.map(BlogMapper.toDomain),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findPublicByIds(ids: string[]): Promise<BlogEntity[]> {
    if (ids.length === 0) {
      return [];
    }

    const rows = await prisma.blog.findMany({
      where: {
        id: { in: ids },
        isPublished: true,
        ...prismaNotDeleted,
      },
      include: { authorUser: { select: authorUserSelect } },
    });

    const byId = new Map(rows.map((row) => [row.id, BlogMapper.toDomain(row)]));
    return ids.map((id) => byId.get(id)).filter((blog): blog is BlogEntity => Boolean(blog));
  }

  async update(id: string, data: UpdateBlogInput): Promise<BlogEntity> {
    const updated = await prisma.blog.update({
      where: { id },
      data: {
        ...(data.slug !== undefined ? { slug: data.slug } : {}),
        ...(data.titleFr !== undefined ? { titleFr: data.titleFr } : {}),
        ...(data.titleEn !== undefined ? { titleEn: data.titleEn } : {}),
        ...(data.excerptFr !== undefined ? { excerptFr: data.excerptFr } : {}),
        ...(data.excerptEn !== undefined ? { excerptEn: data.excerptEn } : {}),
        ...(data.contentFr !== undefined ? { contentFr: data.contentFr } : {}),
        ...(data.contentEn !== undefined ? { contentEn: data.contentEn } : {}),
        ...(data.image !== undefined ? { image: data.image } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.date !== undefined ? { date: data.date } : {}),
        ...(data.readTime !== undefined ? { readTime: data.readTime } : {}),
        ...(data.author !== undefined ? { author: data.author } : {}),
        ...(data.tags !== undefined ? { tags: data.tags } : {}),
        ...(data.isPublished !== undefined ? { isPublished: data.isPublished } : {}),
        ...(data.deletedAt !== undefined ? { deletedAt: data.deletedAt } : {}),
      },
      include: { authorUser: { select: authorUserSelect } },
    });
    return BlogMapper.toDomain(updated);
  }
}
