import type { Skill as PrismaSkill } from '@prisma/client';

import type { SkillEntity } from '../../domain/entities/skill.entity';

/**
 * Maps Prisma Skill rows ↔ domain SkillEntity.
 */
export const SkillMapper = {
  toDomain(row: PrismaSkill): SkillEntity {
    return {
      id: row.id,
      name: row.name,
      category: row.category,
      level: row.level,
      icon: row.icon,
      sortOrder: row.sortOrder,
      ownerId: row.ownerId ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? null,
    };
  },
};
