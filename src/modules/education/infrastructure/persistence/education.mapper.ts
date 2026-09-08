import type { Education as PrismaEducation } from '@prisma/client';

import type { EducationEntity } from '../../domain/entities/education.entity';

/**
 * Maps Prisma Education rows ↔ domain EducationEntity.
 */
export const EducationMapper = {
  toDomain(row: PrismaEducation): EducationEntity {
    return {
      id: row.id,
      degreeFr: row.degreeFr,
      degreeEn: row.degreeEn,
      school: row.school,
      period: row.period,
      link: row.link,
      sortOrder: row.sortOrder,
      ownerId: row.ownerId ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? null,
    };
  },
};
