import type { ContactInfoEntity } from '../../domain/entities/contact-info.entity';

/**
 * Maps domain Contact Infos to the public API response shape.
 */
export const ContactInfoSerializer = {
  one(item: ContactInfoEntity) {
    return {
      id: item.id,
      singletonKey: item.singletonKey,
      name: item.name,
      handle: item.handle,
      titleFr: item.titleFr,
      titleEn: item.titleEn,
      subtitleFr: item.subtitleFr,
      subtitleEn: item.subtitleEn,
      email: item.email,
      phone: item.phone,
      whatsappLink: item.whatsappLink,
      location: item.location,
      website: item.website,
      repository: item.repository,
      github: item.github,
      linkedin: item.linkedin,
      facebook: item.facebook,
      photoUrl: item.photoUrl,
      yearsExperience: item.yearsExperience,
      tags: item.tags,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  },
};
