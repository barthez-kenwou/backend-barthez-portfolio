import type { Partner as PrismaPartner } from '@prisma/client';

import type { PartnerEntity } from '../../domain/entities/partner.entity';

export const PartnerMapper = {
  toDomain(row: PrismaPartner): PartnerEntity {
    return {
      id: row.id,
      name: row.name,
      logoUrl: row.logoUrl,
      websiteUrl: row.websiteUrl ?? null,
      descriptionFr: row.descriptionFr ?? null,
      descriptionEn: row.descriptionEn ?? null,
      relationFr: row.relationFr ?? null,
      relationEn: row.relationEn ?? null,
      sortOrder: row.sortOrder,
      isPublished: row.isPublished,
      ownerId: row.ownerId ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? null,
    };
  },
};
