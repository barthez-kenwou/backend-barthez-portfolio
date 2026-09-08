import type { Service as PrismaService } from '@prisma/client';

import type { ServiceEntity } from '../../domain/entities/service.entity';

/**
 * Maps Prisma Service rows ↔ domain ServiceEntity.
 */
export const ServiceMapper = {
  toDomain(row: PrismaService): ServiceEntity {
    return {
      id: row.id,
      iconKey: row.iconKey,
      titleFr: row.titleFr,
      titleEn: row.titleEn,
      descFr: row.descFr,
      descEn: row.descEn,
      featuresFr: row.featuresFr,
      featuresEn: row.featuresEn,
      priceEur: row.priceEur,
      hourly: row.hourly,
      priceFr: row.priceFr,
      priceEn: row.priceEn,
      sortOrder: row.sortOrder,
      isPublished: row.isPublished,
      ownerId: row.ownerId ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? null,
    };
  },
};
