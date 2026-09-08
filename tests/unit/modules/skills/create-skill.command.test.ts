import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateSkillCommand } from '@/modules/skills/application/commands/create-skill.command';
import type { SkillRepositoryPort } from '@/modules/skills/domain/repositories/skill.repository';

describe('CreateSkillCommand', () => {
  let skillRepository: SkillRepositoryPort;
  let command: CreateSkillCommand;

  beforeEach(() => {
    skillRepository = {
      create: vi.fn().mockImplementation(async (input) => ({
        id: '507f1f77bcf86cd799439011',
        name: input.name,
        category: input.category,
        level: input.level,
        icon: input.icon,
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

    command = new CreateSkillCommand({ skillRepository });
  });

  it('creates a skill for the owner', async () => {
    const item = await command.execute({
      name: '  Sample name  ',
      category: '  Sample category  ',
      level: 80,
      icon: '  Sample icon  ',
      ownerId: 'user_1',
    });

    expect(skillRepository.create).toHaveBeenCalledWith({
      name: 'Sample name',
      category: 'Sample category',
      level: 80,
      icon: 'Sample icon',
      sortOrder: 0,
      ownerId: 'user_1',
    });
    expect(item.ownerId).toBe('user_1');
    expect(item.name).toBe('Sample name');
  });
});
