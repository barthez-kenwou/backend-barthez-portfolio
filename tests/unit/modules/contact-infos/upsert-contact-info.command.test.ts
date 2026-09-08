import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UpsertContactInfoCommand } from '@/modules/contact-infos/application/commands/upsert-contact-info.command';
import type { ContactInfoRepositoryPort } from '@/modules/contact-infos/domain/repositories/contact-info.repository';

const samplePayload = {
  name: 'Barthez',
  handle: '@barthez',
  titleFr: 'Développeur',
  titleEn: 'Developer',
  subtitleFr: 'Sous-titre',
  subtitleEn: 'Subtitle',
  email: 'hello@example.com',
  phone: '+33600000000',
  whatsappLink: 'https://wa.me/33600000000',
  location: 'Paris',
  website: 'https://example.com',
  repository: 'https://github.com/user/repo',
  github: 'https://github.com/user',
  linkedin: 'https://linkedin.com/in/user',
  facebook: 'https://facebook.com/user',
};

describe('UpsertContactInfoCommand', () => {
  let contactInfoRepository: ContactInfoRepositoryPort;
  let command: UpsertContactInfoCommand;

  beforeEach(() => {
    contactInfoRepository = {
      findBySingletonKey: vi.fn(),
      findById: vi.fn(),
      upsertBySingletonKey: vi.fn().mockImplementation(async (key, input) => ({
        id: '507f1f77bcf86cd799439011',
        singletonKey: key,
        ...input,
        photoUrl: input.photoUrl ?? null,
        yearsExperience: input.yearsExperience ?? null,
        tags: input.tags ?? [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })),
      update: vi.fn(),
      softDelete: vi.fn(),
    };

    command = new UpsertContactInfoCommand({ contactInfoRepository });
  });

  it('upserts the default singleton and trims fields', async () => {
    const item = await command.execute({
      ...samplePayload,
      name: '  Barthez  ',
      actorId: 'admin_1',
    });

    expect(contactInfoRepository.upsertBySingletonKey).toHaveBeenCalledWith(
      'default',
      expect.objectContaining({
        singletonKey: 'default',
        name: 'Barthez',
        email: 'hello@example.com',
      }),
    );
    expect(item.singletonKey).toBe('default');
    expect(item.name).toBe('Barthez');
  });
});
