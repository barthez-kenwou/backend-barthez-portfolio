import { prismaNotDeleted } from '@/shared/infrastructure/database/prisma-soft-delete';
import prisma from '@/shared/infrastructure/database/prisma.client';

import type {
  CreateServiceInput,
  ServiceEntity,
  ServiceListResult,
  UpdateServiceInput,
} from '../../domain/entities/service.entity';
import type { ServiceRepositoryPort } from '../../domain/repositories/service.repository';
import { ServiceMapper } from '../persistence/service.mapper';

/**
 * Mongo-backed Service persistence via Prisma.
 */
export class PrismaServiceRepository implements ServiceRepositoryPort {
  async create(data: CreateServiceInput): Promise<ServiceEntity> {
    const row = await prisma.service.create({
      data: {
        iconKey: data.iconKey,
        titleFr: data.titleFr,
        titleEn: data.titleEn,
        descFr: data.descFr,
        descEn: data.descEn,
        featuresFr: data.featuresFr,
        featuresEn: data.featuresEn,
        priceEur: data.priceEur,
        hourly: data.hourly ?? false,
        priceFr: data.priceFr,
        priceEn: data.priceEn,
        sortOrder: data.sortOrder ?? 0,
        isPublished: data.isPublished ?? true,
        ownerId: data.ownerId,
        deletedAt: null,
      },
    });
    return ServiceMapper.toDomain(row);
  }

  async findById(id: string): Promise<ServiceEntity | null> {
    const row = await prisma.service.findFirst({
      where: { id, ...prismaNotDeleted },
    });
    return row ? ServiceMapper.toDomain(row) : null;
  }

  async list(page: number, limit: number): Promise<ServiceListResult> {
    const where = { ...prismaNotDeleted };
    const [rows, total] = await Promise.all([
      prisma.service.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.service.count({ where }),
    ]);

    return {
      items: rows.map(ServiceMapper.toDomain),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
    };
  }

  async update(id: string, data: UpdateServiceInput): Promise<ServiceEntity> {
    const row = await prisma.service.update({
      where: { id },
      data: {
        ...(data.iconKey !== undefined ? { iconKey: data.iconKey } : {}),
        ...(data.titleFr !== undefined ? { titleFr: data.titleFr } : {}),
        ...(data.titleEn !== undefined ? { titleEn: data.titleEn } : {}),
        ...(data.descFr !== undefined ? { descFr: data.descFr } : {}),
        ...(data.descEn !== undefined ? { descEn: data.descEn } : {}),
        ...(data.featuresFr !== undefined ? { featuresFr: data.featuresFr } : {}),
        ...(data.featuresEn !== undefined ? { featuresEn: data.featuresEn } : {}),
        ...(data.priceEur !== undefined ? { priceEur: data.priceEur } : {}),
        ...(data.hourly !== undefined ? { hourly: data.hourly } : {}),
        ...(data.priceFr !== undefined ? { priceFr: data.priceFr } : {}),
        ...(data.priceEn !== undefined ? { priceEn: data.priceEn } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
        ...(data.isPublished !== undefined ? { isPublished: data.isPublished } : {}),
        ...(data.deletedAt !== undefined ? { deletedAt: data.deletedAt } : {}),
      },
    });
    return ServiceMapper.toDomain(row);
  }
}
