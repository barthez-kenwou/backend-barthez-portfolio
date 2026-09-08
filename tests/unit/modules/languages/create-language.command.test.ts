import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateLanguageCommand } from '@/modules/languages/application/commands/create-language.command';
import type { LanguageRepositoryPort } from '@/modules/languages/domain/repositories/language.repository';

describe('CreateLanguageCommand', () => {
  let languageRepository: LanguageRepositoryPort;
  let command: CreateLanguageCommand;

  beforeEach(() => {
    languageRepository = {
      create: vi.fn().mockImplementation(async (input) => ({
        id: '507f1f77bcf86cd799439011',
        language: input.language,
        proficiencyFr: input.proficiencyFr,
        proficiencyEn: input.proficiencyEn,
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

    command = new CreateLanguageCommand({ languageRepository });
  });

  it('creates a language for the owner', async () => {
    const item = await command.execute({
      language: '  Sample language  ',
      proficiencyFr: '  Sample proficiencyFr  ',
      proficiencyEn: '  Sample proficiencyEn  ',
      ownerId: 'user_1',
    });

    expect(languageRepository.create).toHaveBeenCalledWith({
      language: 'Sample language',
      proficiencyFr: 'Sample proficiencyFr',
      proficiencyEn: 'Sample proficiencyEn',
      sortOrder: 0,
      ownerId: 'user_1',
    });
    expect(item.ownerId).toBe('user_1');
    expect(item.language).toBe('Sample language');
  });
});
