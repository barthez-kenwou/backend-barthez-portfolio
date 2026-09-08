import { prismaNotDeleted } from '@/shared/infrastructure/database/prisma-soft-delete';
import prisma from '@/shared/infrastructure/database/prisma.client';

import type {
  CreateLanguageInput,
  LanguageEntity,
  LanguageListResult,
  UpdateLanguageInput,
} from '../../domain/entities/language.entity';
import type { LanguageRepositoryPort } from '../../domain/repositories/language.repository';
import { LanguageMapper } from '../persistence/language.mapper';

/**
 * Mongo-backed Language persistence via Prisma.
 */
export class PrismaLanguageRepository implements LanguageRepositoryPort {
  async create(data: CreateLanguageInput): Promise<LanguageEntity> {
    const row = await prisma.language.create({
      data: {
        language: data.language,
        proficiencyFr: data.proficiencyFr,
        proficiencyEn: data.proficiencyEn,
        sortOrder: data.sortOrder ?? 0,
        ownerId: data.ownerId,
        deletedAt: null,
      },
    });
    return LanguageMapper.toDomain(row);
  }

  async findById(id: string): Promise<LanguageEntity | null> {
    const row = await prisma.language.findFirst({
      where: { id, ...prismaNotDeleted },
    });
    return row ? LanguageMapper.toDomain(row) : null;
  }

  async list(page: number, limit: number): Promise<LanguageListResult> {
    const where = { ...prismaNotDeleted };
    const [rows, total] = await Promise.all([
      prisma.language.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.language.count({ where }),
    ]);

    return {
      items: rows.map(LanguageMapper.toDomain),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
    };
  }

  async update(id: string, data: UpdateLanguageInput): Promise<LanguageEntity> {
    const row = await prisma.language.update({
      where: { id },
      data: {
        ...(data.language !== undefined ? { language: data.language } : {}),
        ...(data.proficiencyFr !== undefined ? { proficiencyFr: data.proficiencyFr } : {}),
        ...(data.proficiencyEn !== undefined ? { proficiencyEn: data.proficiencyEn } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
        ...(data.deletedAt !== undefined ? { deletedAt: data.deletedAt } : {}),
      },
    });
    return LanguageMapper.toDomain(row);
  }
}
