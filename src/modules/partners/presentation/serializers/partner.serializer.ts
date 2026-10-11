import type { PartnerEntity, PartnerListResult } from '../../domain/entities/partner.entity';

/**
 * Maps domain Partners to the public API response shape
 * expected by the frontend PaginatedData contract.
 */
export const PartnerSerializer = {
  one(item: PartnerEntity) {
    return {
      id: item.id,
      name: item.name,
      logoUrl: item.logoUrl,
      websiteUrl: item.websiteUrl ?? undefined,
      descriptionFr: item.descriptionFr ?? undefined,
      descriptionEn: item.descriptionEn ?? undefined,
      relationFr: item.relationFr ?? undefined,
      relationEn: item.relationEn ?? undefined,
      sortOrder: item.sortOrder,
      isPublished: item.isPublished,
      ownerId: item.ownerId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  },

  list(result: PartnerListResult) {
    return {
      items: result.items.map(PartnerSerializer.one),
      totalItems: result.total,
      totalPages: result.totalPages,
      currentPage: result.page,
    };
  },
};
