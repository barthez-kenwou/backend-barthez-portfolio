import type { LanguageEntity, LanguageListResult } from '../../domain/entities/language.entity';

/**
 * Maps domain Languages to the public API response shape.
 */
export const LanguageSerializer = {
  one(item: LanguageEntity) {
    return {
      id: item.id,
      language: item.language,
      proficiencyFr: item.proficiencyFr,
      proficiencyEn: item.proficiencyEn,
      sortOrder: item.sortOrder,
      ownerId: item.ownerId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  },

  list(result: LanguageListResult) {
    return {
      items: result.items.map(LanguageSerializer.one),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  },
};
