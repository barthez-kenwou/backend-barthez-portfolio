import type { ServiceEntity, ServiceListResult } from '../../domain/entities/service.entity';

/**
 * Maps domain Services to the public API response shape.
 */
export const ServiceSerializer = {
  one(item: ServiceEntity) {
    return {
      id: item.id,
      iconKey: item.iconKey,
      titleFr: item.titleFr,
      titleEn: item.titleEn,
      descFr: item.descFr,
      descEn: item.descEn,
      featuresFr: item.featuresFr,
      featuresEn: item.featuresEn,
      priceEur: item.priceEur,
      hourly: item.hourly,
      priceFr: item.priceFr,
      priceEn: item.priceEn,
      sortOrder: item.sortOrder,
      isPublished: item.isPublished,
      ownerId: item.ownerId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  },

  list(result: ServiceListResult) {
    return {
      items: result.items.map(ServiceSerializer.one),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  },
};
