import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateEducationCommand } from '@/modules/education/application/commands/create-education.command';
import type { EducationRepositoryPort } from '@/modules/education/domain/repositories/education.repository';

describe('CreateEducationCommand', () => {
  let educationRepository: EducationRepositoryPort;
  let command: CreateEducationCommand;

  beforeEach(() => {
    educationRepository = {
      create: vi.fn().mockImplementation(async (input) => ({
        id: '507f1f77bcf86cd799439011',
        degreeFr: input.degreeFr,
        degreeEn: input.degreeEn,
        school: input.school,
        period: input.period,
        link: input.link ?? null,
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

    command = new CreateEducationCommand({ educationRepository });
  });

  it('creates a education for the owner', async () => {
    const item = await command.execute({
      degreeFr: '  Sample degreeFr  ',
      degreeEn: '  Sample degreeEn  ',
      school: '  Sample school  ',
      period: '  Sample period  ',
      ownerId: 'user_1',
    });

    expect(educationRepository.create).toHaveBeenCalledWith({
      degreeFr: 'Sample degreeFr',
      degreeEn: 'Sample degreeEn',
      school: 'Sample school',
      period: 'Sample period',
      link: null,
      sortOrder: 0,
      ownerId: 'user_1',
    });
    expect(item.ownerId).toBe('user_1');
    expect(item.degreeFr).toBe('Sample degreeFr');
  });
});
