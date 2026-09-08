import type { Reference as PrismaReference } from '@prisma/client';

import type { ReferenceEntity } from '../../domain/entities/reference.entity';

/**
 * Maps Prisma Reference rows ↔ domain ReferenceEntity.
 */
export const ReferenceMapper = {
  toDomain(row: PrismaReference): ReferenceEntity {
    return {
      id: row.id,
      name: row.name,
      roleFr: row.roleFr,
      roleEn: row.roleEn,
      company: row.company,
      email: row.email,
      phone: row.phone,
      sortOrder: row.sortOrder,
      ownerId: row.ownerId ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? null,
    };
  },
};
