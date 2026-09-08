import type {
  CertificationEntity,
  CertificationListResult,
} from '../../domain/entities/certification.entity';

/**
 * Maps domain Certifications to the public API response shape.
 */
export const CertificationSerializer = {
  one(item: CertificationEntity) {
    return {
      id: item.id,
      name: item.name,
      issuer: item.issuer,
      year: item.year,
      link: item.link,
      sortOrder: item.sortOrder,
      ownerId: item.ownerId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  },

  list(result: CertificationListResult) {
    return {
      items: result.items.map(CertificationSerializer.one),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  },
};
