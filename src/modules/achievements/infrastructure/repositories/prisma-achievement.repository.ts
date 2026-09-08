import { prismaNotDeleted } from '@/shared/infrastructure/database/prisma-soft-delete';
import prisma from '@/shared/infrastructure/database/prisma.client';

import type {
  AchievementEntity,
  AchievementListResult,
  CreateAchievementInput,
  UpdateAchievementInput,
} from '../../domain/entities/achievement.entity';
import type { AchievementRepositoryPort } from '../../domain/repositories/achievement.repository';
import { AchievementMapper } from '../persistence/achievement.mapper';

/**
 * Mongo-backed Achievement persistence via Prisma.
 */
export class PrismaAchievementRepository implements AchievementRepositoryPort {
  async create(data: CreateAchievementInput): Promise<AchievementEntity> {
    const row = await prisma.achievement.create({
      data: {
        iconKey: data.iconKey,
        value: data.value,
        labelFr: data.labelFr,
        labelEn: data.labelEn,
        sortOrder: data.sortOrder ?? 0,
        ownerId: data.ownerId,
        deletedAt: null,
      },
    });
    return AchievementMapper.toDomain(row);
  }

  async findById(id: string): Promise<AchievementEntity | null> {
    const row = await prisma.achievement.findFirst({
      where: { id, ...prismaNotDeleted },
    });
    return row ? AchievementMapper.toDomain(row) : null;
  }

  async list(page: number, limit: number): Promise<AchievementListResult> {
    const where = { ...prismaNotDeleted };
    const [rows, total] = await Promise.all([
      prisma.achievement.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.achievement.count({ where }),
    ]);

    return {
      items: rows.map(AchievementMapper.toDomain),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
    };
  }

  async update(id: string, data: UpdateAchievementInput): Promise<AchievementEntity> {
    const row = await prisma.achievement.update({
      where: { id },
      data: {
        ...(data.iconKey !== undefined ? { iconKey: data.iconKey } : {}),
        ...(data.value !== undefined ? { value: data.value } : {}),
        ...(data.labelFr !== undefined ? { labelFr: data.labelFr } : {}),
        ...(data.labelEn !== undefined ? { labelEn: data.labelEn } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
        ...(data.deletedAt !== undefined ? { deletedAt: data.deletedAt } : {}),
      },
    });
    return AchievementMapper.toDomain(row);
  }
}
