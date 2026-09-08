import type {
  Prisma,
  TestimonialSource as PrismaSource,
  TestimonialModerationStatus,
} from '@prisma/client';

import { prismaNotDeleted } from '@/shared/infrastructure/database/prisma-soft-delete';
import prisma from '@/shared/infrastructure/database/prisma.client';

import type {
  CreateTestimonialInput,
  TestimonialEntity,
  TestimonialListFilters,
  TestimonialListResult,
  UpdateTestimonialInput,
} from '../../domain/entities/testimonial.entity';
import type { TestimonialRepositoryPort } from '../../domain/repositories/testimonial.repository';
import { TestimonialMapper } from '../persistence/testimonial.mapper';

export class PrismaTestimonialRepository implements TestimonialRepositoryPort {
  async create(data: CreateTestimonialInput): Promise<TestimonialEntity> {
    const row = await prisma.testimonial.create({
      data: {
        rating: data.rating,
        textFr: data.textFr,
        textEn: data.textEn,
        nameFr: data.nameFr,
        nameEn: data.nameEn,
        roleFr: data.roleFr,
        roleEn: data.roleEn,
        company: data.company ?? null,
        email: data.email ?? null,
        isPublished: data.isPublished ?? false,
        status: (data.status ?? 'pending') as TestimonialModerationStatus,
        source: (data.source ?? 'admin') as PrismaSource,
        sortOrder: data.sortOrder ?? 0,
        ownerId: data.ownerId ?? null,
        deletedAt: null,
      },
    });
    return TestimonialMapper.toDomain(row);
  }

  async findById(id: string): Promise<TestimonialEntity | null> {
    const row = await prisma.testimonial.findFirst({
      where: { id, ...prismaNotDeleted },
    });
    return row ? TestimonialMapper.toDomain(row) : null;
  }

  async list(filters: TestimonialListFilters): Promise<TestimonialListResult> {
    const where: Prisma.TestimonialWhereInput = filters.publicOnly
      ? {
          AND: [
            prismaNotDeleted,
            { OR: [{ isPublished: true }, { status: 'approved' }] },
            { status: { notIn: ['pending', 'rejected'] } },
          ],
        }
      : {
          ...prismaNotDeleted,
          ...(filters.status ? { status: filters.status } : {}),
          ...(filters.isPublished !== undefined ? { isPublished: filters.isPublished } : {}),
        };

    const [rows, total] = await Promise.all([
      prisma.testimonial.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.testimonial.count({ where }),
    ]);

    return {
      items: rows.map(TestimonialMapper.toDomain),
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit) || 0,
    };
  }

  async update(id: string, data: UpdateTestimonialInput): Promise<TestimonialEntity> {
    const row = await prisma.testimonial.update({
      where: { id },
      data: {
        ...(data.rating !== undefined ? { rating: data.rating } : {}),
        ...(data.textFr !== undefined ? { textFr: data.textFr } : {}),
        ...(data.textEn !== undefined ? { textEn: data.textEn } : {}),
        ...(data.nameFr !== undefined ? { nameFr: data.nameFr } : {}),
        ...(data.nameEn !== undefined ? { nameEn: data.nameEn } : {}),
        ...(data.roleFr !== undefined ? { roleFr: data.roleFr } : {}),
        ...(data.roleEn !== undefined ? { roleEn: data.roleEn } : {}),
        ...(data.company !== undefined ? { company: data.company } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.isPublished !== undefined ? { isPublished: data.isPublished } : {}),
        ...(data.status !== undefined
          ? { status: data.status as TestimonialModerationStatus }
          : {}),
        ...(data.source !== undefined ? { source: data.source as PrismaSource } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
        ...(data.deletedAt !== undefined ? { deletedAt: data.deletedAt } : {}),
      },
    });
    return TestimonialMapper.toDomain(row);
  }
}
