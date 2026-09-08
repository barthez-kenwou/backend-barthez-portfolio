import { prismaNotDeleted } from '@/shared/infrastructure/database/prisma-soft-delete';
import prisma from '@/shared/infrastructure/database/prisma.client';

import type {
  CreateExperienceInput,
  ExperienceEntity,
  ExperienceListResult,
  UpdateExperienceInput,
} from '../../domain/entities/experience.entity';
import type { ExperienceRepositoryPort } from '../../domain/repositories/experience.repository';
import { ExperienceMapper } from '../persistence/experience.mapper';

/**
 * Mongo-backed Experience persistence via Prisma.
 */
export class PrismaExperienceRepository implements ExperienceRepositoryPort {
  async create(data: CreateExperienceInput): Promise<ExperienceEntity> {
    const row = await prisma.experience.create({
      data: {
        titleFr: data.titleFr,
        titleEn: data.titleEn,
        companyFr: data.companyFr,
        companyEn: data.companyEn,
        period: data.period,
        descriptionFr: data.descriptionFr,
        descriptionEn: data.descriptionEn,
        sortOrder: data.sortOrder ?? 0,
        ownerId: data.ownerId,
        deletedAt: null,
      },
    });
    return ExperienceMapper.toDomain(row);
  }

  async findById(id: string): Promise<ExperienceEntity | null> {
    const row = await prisma.experience.findFirst({
      where: { id, ...prismaNotDeleted },
    });
    return row ? ExperienceMapper.toDomain(row) : null;
  }

  async list(page: number, limit: number): Promise<ExperienceListResult> {
    const where = { ...prismaNotDeleted };
    const [rows, total] = await Promise.all([
      prisma.experience.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.experience.count({ where }),
    ]);

    return {
      items: rows.map(ExperienceMapper.toDomain),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
    };
  }

  async update(id: string, data: UpdateExperienceInput): Promise<ExperienceEntity> {
    const row = await prisma.experience.update({
      where: { id },
      data: {
        ...(data.titleFr !== undefined ? { titleFr: data.titleFr } : {}),
        ...(data.titleEn !== undefined ? { titleEn: data.titleEn } : {}),
        ...(data.companyFr !== undefined ? { companyFr: data.companyFr } : {}),
        ...(data.companyEn !== undefined ? { companyEn: data.companyEn } : {}),
        ...(data.period !== undefined ? { period: data.period } : {}),
        ...(data.descriptionFr !== undefined ? { descriptionFr: data.descriptionFr } : {}),
        ...(data.descriptionEn !== undefined ? { descriptionEn: data.descriptionEn } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
        ...(data.deletedAt !== undefined ? { deletedAt: data.deletedAt } : {}),
      },
    });
    return ExperienceMapper.toDomain(row);
  }
}
