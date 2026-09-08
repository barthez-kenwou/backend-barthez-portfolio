import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateExperienceCommand } from '@/modules/experiences/application/commands/create-experience.command';
import type { ExperienceRepositoryPort } from '@/modules/experiences/domain/repositories/experience.repository';

describe('CreateExperienceCommand', () => {
  let experienceRepository: ExperienceRepositoryPort;
  let command: CreateExperienceCommand;

  beforeEach(() => {
    experienceRepository = {
      create: vi.fn().mockImplementation(async (input) => ({
        id: '507f1f77bcf86cd799439011',
        titleFr: input.titleFr,
        titleEn: input.titleEn,
        companyFr: input.companyFr,
        companyEn: input.companyEn,
        period: input.period,
        descriptionFr: input.descriptionFr ?? [],
        descriptionEn: input.descriptionEn ?? [],
        sortOrder: input.sortOrder ?? 0,
        ownerId: input.ownerId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })),
      findById: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
    };

    command = new CreateExperienceCommand({ experienceRepository });
  });

  it('creates a experience for the owner', async () => {
    const item = await command.execute({
      titleFr: '  Sample titleFr  ',
      titleEn: '  Sample titleEn  ',
      companyFr: '  Sample companyFr  ',
      companyEn: '  Sample companyEn  ',
      period: '  Sample period  ',
      descriptionFr: ['  one  ', 'two'],
      descriptionEn: ['  one  ', 'two'],
      ownerId: 'user_1',
    });

    expect(experienceRepository.create).toHaveBeenCalledWith({
      titleFr: 'Sample titleFr',
      titleEn: 'Sample titleEn',
      companyFr: 'Sample companyFr',
      companyEn: 'Sample companyEn',
      period: 'Sample period',
      descriptionFr: ['one', 'two'],
      descriptionEn: ['one', 'two'],
      sortOrder: 0,
      ownerId: 'user_1',
    });
    expect(item.ownerId).toBe('user_1');
    expect(item.titleFr).toBe('Sample titleFr');
  });
});
