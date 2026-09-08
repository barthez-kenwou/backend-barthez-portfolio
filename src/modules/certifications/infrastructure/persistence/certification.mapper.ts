import type { Certification as PrismaCertification } from '@prisma/client';

import type { CertificationEntity } from '../../domain/entities/certification.entity';

/**
 * Maps Prisma Certification rows ↔ domain CertificationEntity.
 */
export const CertificationMapper = {
  toDomain(row: PrismaCertification): CertificationEntity {
    return {
      id: row.id,
      name: row.name,
      issuer: row.issuer,
      year: row.year,
      link: row.link,
      sortOrder: row.sortOrder,
      ownerId: row.ownerId ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? null,
    };
  },
};
