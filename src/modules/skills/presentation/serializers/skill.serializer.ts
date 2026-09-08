import type { SkillEntity, SkillListResult } from '../../domain/entities/skill.entity';

/**
 * Maps domain Skills to the public API response shape.
 */
export const SkillSerializer = {
  one(item: SkillEntity) {
    return {
      id: item.id,
      name: item.name,
      category: item.category,
      level: item.level,
      icon: item.icon,
      sortOrder: item.sortOrder,
      ownerId: item.ownerId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  },

  list(result: SkillListResult) {
    return {
      items: result.items.map(SkillSerializer.one),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  },
};
