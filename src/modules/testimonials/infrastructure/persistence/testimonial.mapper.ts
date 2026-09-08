import type { Testimonial as PrismaTestimonial } from '@prisma/client';

import type {
  TestimonialEntity,
  TestimonialSource,
  TestimonialStatus,
} from '../../domain/entities/testimonial.entity';

export const TestimonialMapper = {
  toDomain(row: PrismaTestimonial): TestimonialEntity {
    return {
      id: row.id,
      rating: row.rating,
      textFr: row.textFr,
      textEn: row.textEn,
      nameFr: row.nameFr,
      nameEn: row.nameEn,
      roleFr: row.roleFr,
      roleEn: row.roleEn,
      company: row.company ?? null,
      email: row.email ?? null,
      isPublished: row.isPublished,
      status: row.status as TestimonialStatus,
      source: row.source as TestimonialSource,
      sortOrder: row.sortOrder,
      ownerId: row.ownerId ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? null,
    };
  },
};
