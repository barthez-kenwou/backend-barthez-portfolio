import type {
  AchievementEntity,
  AchievementListResult,
} from '../../domain/entities/achievement.entity';

/**
 * Maps domain Achievements to the public API response shape.
 */
export const AchievementSerializer = {
  one(item: AchievementEntity) {
    return {
      id: item.id,
      iconKey: item.iconKey,
      value: item.value,
      labelFr: item.labelFr,
      labelEn: item.labelEn,
      sortOrder: item.sortOrder,
      ownerId: item.ownerId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  },

  list(result: AchievementListResult) {
    return {
      items: result.items.map(AchievementSerializer.one),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  },
};
