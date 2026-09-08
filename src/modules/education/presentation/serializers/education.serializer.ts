import type { EducationEntity, EducationListResult } from '../../domain/entities/education.entity';

/**
 * Maps domain Education to the public API response shape.
 */
export const EducationSerializer = {
  one(item: EducationEntity) {
    return {
      id: item.id,
      degreeFr: item.degreeFr,
      degreeEn: item.degreeEn,
      school: item.school,
      period: item.period,
      link: item.link,
      sortOrder: item.sortOrder,
      ownerId: item.ownerId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  },

  list(result: EducationListResult) {
    return {
      items: result.items.map(EducationSerializer.one),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  },
};
