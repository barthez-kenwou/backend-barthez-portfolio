import { prismaNotDeleted } from '@/shared/infrastructure/database/prisma-soft-delete';
import prisma from '@/shared/infrastructure/database/prisma.client';

import type {
  CreateReferenceInput,
  ReferenceEntity,
  ReferenceListResult,
  UpdateReferenceInput,
} from '../../domain/entities/reference.entity';
import type { ReferenceRepositoryPort } from '../../domain/repositories/reference.repository';
import { ReferenceMapper } from '../persistence/reference.mapper';

/**
 * Mongo-backed Reference persistence via Prisma.
 */
export class PrismaReferenceRepository implements ReferenceRepositoryPort {
  async create(data: CreateReferenceInput): Promise<ReferenceEntity> {
    const row = await prisma.reference.create({
      data: {
        name: data.name,
        roleFr: data.roleFr,
        roleEn: data.roleEn,
        company: data.company,
        email: data.email,
        phone: data.phone,
        sortOrder: data.sortOrder ?? 0,
        ownerId: data.ownerId,
        deletedAt: null,
      },
    });
    return ReferenceMapper.toDomain(row);
  }

  async findById(id: string): Promise<ReferenceEntity | null> {
    const row = await prisma.reference.findFirst({
      where: { id, ...prismaNotDeleted },
    });
    return row ? ReferenceMapper.toDomain(row) : null;
  }

  async list(page: number, limit: number): Promise<ReferenceListResult> {
    const where = { ...prismaNotDeleted };
    const [rows, total] = await Promise.all([
      prisma.reference.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.reference.count({ where }),
    ]);

    return {
      items: rows.map(ReferenceMapper.toDomain),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
    };
  }

  async update(id: string, data: UpdateReferenceInput): Promise<ReferenceEntity> {
    const row = await prisma.reference.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.roleFr !== undefined ? { roleFr: data.roleFr } : {}),
        ...(data.roleEn !== undefined ? { roleEn: data.roleEn } : {}),
        ...(data.company !== undefined ? { company: data.company } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
        ...(data.deletedAt !== undefined ? { deletedAt: data.deletedAt } : {}),
      },
    });
    return ReferenceMapper.toDomain(row);
  }
}
