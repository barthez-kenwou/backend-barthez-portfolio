import type { Achievement as PrismaAchievement } from '@prisma/client';

import type { AchievementEntity } from '../../domain/entities/achievement.entity';

/**
 * Maps Prisma Achievement rows ↔ domain AchievementEntity.
 */
export const AchievementMapper = {
  toDomain(row: PrismaAchievement): AchievementEntity {
    return {
      id: row.id,
      iconKey: row.iconKey,
      value: row.value,
      labelFr: row.labelFr,
      labelEn: row.labelEn,
      sortOrder: row.sortOrder,
      ownerId: row.ownerId ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? null,
    };
  },
};
