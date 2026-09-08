import type { ContactInfo as PrismaContactInfo } from '@prisma/client';

import type { ContactInfoEntity } from '../../domain/entities/contact-info.entity';

/**
 * Maps Prisma ContactInfo rows ↔ domain ContactInfoEntity.
 */
export const ContactInfoMapper = {
  toDomain(row: PrismaContactInfo): ContactInfoEntity {
    return {
      id: row.id,
      singletonKey: row.singletonKey,
      name: row.name,
      handle: row.handle,
      titleFr: row.titleFr,
      titleEn: row.titleEn,
      subtitleFr: row.subtitleFr,
      subtitleEn: row.subtitleEn,
      email: row.email,
      phone: row.phone,
      whatsappLink: row.whatsappLink,
      location: row.location,
      website: row.website,
      repository: row.repository,
      github: row.github,
      linkedin: row.linkedin,
      facebook: row.facebook,
      photoUrl: row.photoUrl ?? null,
      yearsExperience: row.yearsExperience ?? null,
      tags: row.tags ?? [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? null,
    };
  },
};
