import { prismaNotDeleted } from '@/shared/infrastructure/database/prisma-soft-delete';
import prisma from '@/shared/infrastructure/database/prisma.client';

import type {
  ContactInfoEntity,
  UpdateContactInfoInput,
  UpsertContactInfoInput,
} from '../../domain/entities/contact-info.entity';
import type { ContactInfoRepositoryPort } from '../../domain/repositories/contact-info.repository';
import { ContactInfoMapper } from '../persistence/contact-info.mapper';

/**
 * Mongo-backed Contact Info persistence via Prisma (singleton by singletonKey).
 */
export class PrismaContactInfoRepository implements ContactInfoRepositoryPort {
  async findBySingletonKey(key: string): Promise<ContactInfoEntity | null> {
    const row = await prisma.contactInfo.findFirst({
      where: { singletonKey: key, ...prismaNotDeleted },
    });
    return row ? ContactInfoMapper.toDomain(row) : null;
  }

  async findById(id: string): Promise<ContactInfoEntity | null> {
    const row = await prisma.contactInfo.findFirst({
      where: { id, ...prismaNotDeleted },
    });
    return row ? ContactInfoMapper.toDomain(row) : null;
  }

  async upsertBySingletonKey(
    key: string,
    data: UpsertContactInfoInput,
  ): Promise<ContactInfoEntity> {
    const payload = {
      name: data.name,
      handle: data.handle,
      titleFr: data.titleFr,
      titleEn: data.titleEn,
      subtitleFr: data.subtitleFr,
      subtitleEn: data.subtitleEn,
      email: data.email,
      phone: data.phone,
      whatsappLink: data.whatsappLink,
      location: data.location,
      website: data.website,
      repository: data.repository,
      github: data.github,
      linkedin: data.linkedin,
      facebook: data.facebook,
      photoUrl: data.photoUrl ?? null,
      yearsExperience: data.yearsExperience ?? null,
      tags: data.tags ?? [],
      deletedAt: null,
    };

    const row = await prisma.contactInfo.upsert({
      where: { singletonKey: key },
      create: { singletonKey: key, ...payload },
      update: payload,
    });
    return ContactInfoMapper.toDomain(row);
  }

  async update(id: string, data: UpdateContactInfoInput): Promise<ContactInfoEntity> {
    const row = await prisma.contactInfo.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.handle !== undefined ? { handle: data.handle } : {}),
        ...(data.titleFr !== undefined ? { titleFr: data.titleFr } : {}),
        ...(data.titleEn !== undefined ? { titleEn: data.titleEn } : {}),
        ...(data.subtitleFr !== undefined ? { subtitleFr: data.subtitleFr } : {}),
        ...(data.subtitleEn !== undefined ? { subtitleEn: data.subtitleEn } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.whatsappLink !== undefined ? { whatsappLink: data.whatsappLink } : {}),
        ...(data.location !== undefined ? { location: data.location } : {}),
        ...(data.website !== undefined ? { website: data.website } : {}),
        ...(data.repository !== undefined ? { repository: data.repository } : {}),
        ...(data.github !== undefined ? { github: data.github } : {}),
        ...(data.linkedin !== undefined ? { linkedin: data.linkedin } : {}),
        ...(data.facebook !== undefined ? { facebook: data.facebook } : {}),
        ...(data.photoUrl !== undefined ? { photoUrl: data.photoUrl } : {}),
        ...(data.yearsExperience !== undefined ? { yearsExperience: data.yearsExperience } : {}),
        ...(data.tags !== undefined ? { tags: data.tags } : {}),
        ...(data.deletedAt !== undefined ? { deletedAt: data.deletedAt } : {}),
      },
    });
    return ContactInfoMapper.toDomain(row);
  }

  async softDelete(id: string): Promise<ContactInfoEntity> {
    return this.update(id, { deletedAt: new Date() });
  }
}
