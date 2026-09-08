import { prismaNotDeleted } from '@/shared/infrastructure/database/prisma-soft-delete';
import prisma from '@/shared/infrastructure/database/prisma.client';

import type {
  CreateEducationInput,
  EducationEntity,
  EducationListResult,
  UpdateEducationInput,
} from '../../domain/entities/education.entity';
import type { EducationRepositoryPort } from '../../domain/repositories/education.repository';
import { EducationMapper } from '../persistence/education.mapper';

/**
 * Mongo-backed Education persistence via Prisma.
 */
export class PrismaEducationRepository implements EducationRepositoryPort {
  async create(data: CreateEducationInput): Promise<EducationEntity> {
    const row = await prisma.education.create({
      data: {
        degreeFr: data.degreeFr,
        degreeEn: data.degreeEn,
        school: data.school,
        period: data.period,
        link: data.link ?? null,
        sortOrder: data.sortOrder ?? 0,
        ownerId: data.ownerId,
        deletedAt: null,
      },
    });
    return EducationMapper.toDomain(row);
  }

  async findById(id: string): Promise<EducationEntity | null> {
    const row = await prisma.education.findFirst({
      where: { id, ...prismaNotDeleted },
    });
    return row ? EducationMapper.toDomain(row) : null;
  }

  async list(page: number, limit: number): Promise<EducationListResult> {
    const where = { ...prismaNotDeleted };
    const [rows, total] = await Promise.all([
      prisma.education.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.education.count({ where }),
    ]);

    return {
      items: rows.map(EducationMapper.toDomain),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
    };
  }

  async update(id: string, data: UpdateEducationInput): Promise<EducationEntity> {
    const row = await prisma.education.update({
      where: { id },
      data: {
        ...(data.degreeFr !== undefined ? { degreeFr: data.degreeFr } : {}),
        ...(data.degreeEn !== undefined ? { degreeEn: data.degreeEn } : {}),
        ...(data.school !== undefined ? { school: data.school } : {}),
        ...(data.period !== undefined ? { period: data.period } : {}),
        ...(data.link !== undefined ? { link: data.link } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
        ...(data.deletedAt !== undefined ? { deletedAt: data.deletedAt } : {}),
      },
    });
    return EducationMapper.toDomain(row);
  }
}
