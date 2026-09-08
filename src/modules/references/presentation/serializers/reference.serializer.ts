import type { ReferenceEntity, ReferenceListResult } from '../../domain/entities/reference.entity';

/**
 * Maps domain References to the public API response shape.
 */
export const ReferenceSerializer = {
  one(item: ReferenceEntity) {
    return {
      id: item.id,
      name: item.name,
      roleFr: item.roleFr,
      roleEn: item.roleEn,
      company: item.company,
      email: item.email,
      phone: item.phone,
      sortOrder: item.sortOrder,
      ownerId: item.ownerId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  },

  list(result: ReferenceListResult) {
    return {
      items: result.items.map(ReferenceSerializer.one),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  },
};
