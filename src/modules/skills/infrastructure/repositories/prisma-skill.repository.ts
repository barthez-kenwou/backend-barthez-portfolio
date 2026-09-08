import { prismaNotDeleted } from '@/shared/infrastructure/database/prisma-soft-delete';
import prisma from '@/shared/infrastructure/database/prisma.client';

import type {
  CreateSkillInput,
  SkillEntity,
  SkillListResult,
  UpdateSkillInput,
} from '../../domain/entities/skill.entity';
import type { SkillRepositoryPort } from '../../domain/repositories/skill.repository';
import { SkillMapper } from '../persistence/skill.mapper';

/**
 * Mongo-backed Skill persistence via Prisma.
 */
export class PrismaSkillRepository implements SkillRepositoryPort {
  async create(data: CreateSkillInput): Promise<SkillEntity> {
    const row = await prisma.skill.create({
      data: {
        name: data.name,
        category: data.category,
        level: data.level,
        icon: data.icon,
        sortOrder: data.sortOrder ?? 0,
        ownerId: data.ownerId,
        deletedAt: null,
      },
    });
    return SkillMapper.toDomain(row);
  }

  async findById(id: string): Promise<SkillEntity | null> {
    const row = await prisma.skill.findFirst({
      where: { id, ...prismaNotDeleted },
    });
    return row ? SkillMapper.toDomain(row) : null;
  }

  async list(page: number, limit: number): Promise<SkillListResult> {
    const where = { ...prismaNotDeleted };
    const [rows, total] = await Promise.all([
      prisma.skill.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.skill.count({ where }),
    ]);

    return {
      items: rows.map(SkillMapper.toDomain),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
    };
  }

  async update(id: string, data: UpdateSkillInput): Promise<SkillEntity> {
    const row = await prisma.skill.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.level !== undefined ? { level: data.level } : {}),
        ...(data.icon !== undefined ? { icon: data.icon } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
        ...(data.deletedAt !== undefined ? { deletedAt: data.deletedAt } : {}),
      },
    });
    return SkillMapper.toDomain(row);
  }
}
