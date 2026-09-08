import type { Language as PrismaLanguage } from '@prisma/client';

import type { LanguageEntity } from '../../domain/entities/language.entity';

/**
 * Maps Prisma Language rows ↔ domain LanguageEntity.
 */
export const LanguageMapper = {
  toDomain(row: PrismaLanguage): LanguageEntity {
    return {
      id: row.id,
      language: row.language,
      proficiencyFr: row.proficiencyFr,
      proficiencyEn: row.proficiencyEn,
      sortOrder: row.sortOrder,
      ownerId: row.ownerId ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? null,
    };
  },
};
