import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateAchievementCommand } from '@/modules/achievements/application/commands/create-achievement.command';
import type { AchievementRepositoryPort } from '@/modules/achievements/domain/repositories/achievement.repository';

describe('CreateAchievementCommand', () => {
  let achievementRepository: AchievementRepositoryPort;
  let command: CreateAchievementCommand;

  beforeEach(() => {
    achievementRepository = {
      create: vi.fn().mockImplementation(async (input) => ({
        id: '507f1f77bcf86cd799439011',
        iconKey: input.iconKey,
        value: input.value,
        labelFr: input.labelFr,
        labelEn: input.labelEn,
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

    command = new CreateAchievementCommand({ achievementRepository });
  });

  it('creates a achievement for the owner', async () => {
    const item = await command.execute({
      iconKey: '  Sample iconKey  ',
      value: '  Sample value  ',
      labelFr: '  Sample labelFr  ',
      labelEn: '  Sample labelEn  ',
      ownerId: 'user_1',
    });

    expect(achievementRepository.create).toHaveBeenCalledWith({
      iconKey: 'Sample iconKey',
      value: 'Sample value',
      labelFr: 'Sample labelFr',
      labelEn: 'Sample labelEn',
      sortOrder: 0,
      ownerId: 'user_1',
    });
    expect(item.ownerId).toBe('user_1');
    expect(item.iconKey).toBe('Sample iconKey');
  });
});
