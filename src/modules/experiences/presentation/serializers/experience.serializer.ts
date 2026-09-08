import type {
  ExperienceEntity,
  ExperienceListResult,
} from '../../domain/entities/experience.entity';

/**
 * Maps domain Experiences to the public API response shape.
 */
export const ExperienceSerializer = {
  one(item: ExperienceEntity) {
    return {
      id: item.id,
      titleFr: item.titleFr,
      titleEn: item.titleEn,
      companyFr: item.companyFr,
      companyEn: item.companyEn,
      period: item.period,
      descriptionFr: item.descriptionFr,
      descriptionEn: item.descriptionEn,
      sortOrder: item.sortOrder,
      ownerId: item.ownerId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  },

  list(result: ExperienceListResult) {
    return {
      items: result.items.map(ExperienceSerializer.one),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  },
};
