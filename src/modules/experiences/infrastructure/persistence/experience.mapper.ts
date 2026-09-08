import type { Experience as PrismaExperience } from '@prisma/client';

import type { ExperienceEntity } from '../../domain/entities/experience.entity';

/**
 * Maps Prisma Experience rows ↔ domain ExperienceEntity.
 */
export const ExperienceMapper = {
  toDomain(row: PrismaExperience): ExperienceEntity {
    return {
      id: row.id,
      titleFr: row.titleFr,
      titleEn: row.titleEn,
      companyFr: row.companyFr,
      companyEn: row.companyEn,
      period: row.period,
      descriptionFr: row.descriptionFr,
      descriptionEn: row.descriptionEn,
      sortOrder: row.sortOrder,
      ownerId: row.ownerId ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? null,
    };
  },
};
