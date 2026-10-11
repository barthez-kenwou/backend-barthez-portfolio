import { prismaNotDeleted } from '@/shared/infrastructure/database/prisma-soft-delete';
import prisma from '@/shared/infrastructure/database/prisma.client';

import type {
  CreatePartnerInput,
  PartnerEntity,
  PartnerListFilters,
  PartnerListResult,
  UpdatePartnerInput,
} from '../../domain/entities/partner.entity';
import type { PartnerRepositoryPort } from '../../domain/repositories/partner.repository';
import { PartnerMapper } from '../persistence/partner.mapper';

export class PrismaPartnerRepository implements PartnerRepositoryPort {
  async create(data: CreatePartnerInput): Promise<PartnerEntity> {
    const row = await prisma.partner.create({
      data: {
        name: data.name,
        logoUrl: data.logoUrl,
        websiteUrl: data.websiteUrl ?? null,
        descriptionFr: data.descriptionFr ?? null,
        descriptionEn: data.descriptionEn ?? null,
        relationFr: data.relationFr ?? null,
        relationEn: data.relationEn ?? null,
        sortOrder: data.sortOrder ?? 0,
        isPublished: data.isPublished ?? true,
        ownerId: data.ownerId,
        deletedAt: null,
      },
    });
    return PartnerMapper.toDomain(row);
  }

  async findById(id: string): Promise<PartnerEntity | null> {
    const row = await prisma.partner.findFirst({
      where: { id, ...prismaNotDeleted },
    });
    return row ? PartnerMapper.toDomain(row) : null;
  }

  async list(filters: PartnerListFilters): Promise<PartnerListResult> {
    const where = {
      ...prismaNotDeleted,
      ...(filters.isPublished !== undefined ? { isPublished: filters.isPublished } : {}),
    };
    const [rows, total] = await Promise.all([
      prisma.partner.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.partner.count({ where }),
    ]);

    return {
      items: rows.map(PartnerMapper.toDomain),
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit) || 0,
    };
  }

  async update(id: string, data: UpdatePartnerInput): Promise<PartnerEntity> {
    const row = await prisma.partner.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.logoUrl !== undefined ? { logoUrl: data.logoUrl } : {}),
        ...(data.websiteUrl !== undefined ? { websiteUrl: data.websiteUrl } : {}),
        ...(data.descriptionFr !== undefined ? { descriptionFr: data.descriptionFr } : {}),
        ...(data.descriptionEn !== undefined ? { descriptionEn: data.descriptionEn } : {}),
        ...(data.relationFr !== undefined ? { relationFr: data.relationFr } : {}),
        ...(data.relationEn !== undefined ? { relationEn: data.relationEn } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
        ...(data.isPublished !== undefined ? { isPublished: data.isPublished } : {}),
        ...(data.deletedAt !== undefined ? { deletedAt: data.deletedAt } : {}),
      },
    });
    return PartnerMapper.toDomain(row);
  }
}
