import type {
  TestimonialEntity,
  TestimonialListResult,
} from '../../domain/entities/testimonial.entity';

export const TestimonialSerializer = {
  one(item: TestimonialEntity, opts: { includeEmail?: boolean } = {}) {
    return {
      id: item.id,
      rating: item.rating,
      textFr: item.textFr,
      textEn: item.textEn,
      nameFr: item.nameFr,
      nameEn: item.nameEn,
      roleFr: item.roleFr,
      roleEn: item.roleEn,
      company: item.company,
      ...(opts.includeEmail ? { email: item.email } : {}),
      isPublished: item.isPublished,
      status: item.status,
      source: item.source,
      sortOrder: item.sortOrder,
      ownerId: item.ownerId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  },

  list(result: TestimonialListResult, opts: { includeEmail?: boolean } = {}) {
    return {
      items: result.items.map((item) => TestimonialSerializer.one(item, opts)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  },
};
