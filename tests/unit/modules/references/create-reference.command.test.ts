import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateReferenceCommand } from '@/modules/references/application/commands/create-reference.command';
import type { ReferenceRepositoryPort } from '@/modules/references/domain/repositories/reference.repository';

describe('CreateReferenceCommand', () => {
  let referenceRepository: ReferenceRepositoryPort;
  let command: CreateReferenceCommand;

  beforeEach(() => {
    referenceRepository = {
      create: vi.fn().mockImplementation(async (input) => ({
        id: '507f1f77bcf86cd799439011',
        name: input.name,
        roleFr: input.roleFr,
        roleEn: input.roleEn,
        company: input.company,
        email: input.email,
        phone: input.phone,
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

    command = new CreateReferenceCommand({ referenceRepository });
  });

  it('creates a reference for the owner', async () => {
    const item = await command.execute({
      name: '  Sample name  ',
      roleFr: '  Sample roleFr  ',
      roleEn: '  Sample roleEn  ',
      company: '  Sample company  ',
      email: 'ref@example.com',
      phone: '  Sample phone  ',
      ownerId: 'user_1',
    });

    expect(referenceRepository.create).toHaveBeenCalledWith({
      name: 'Sample name',
      roleFr: 'Sample roleFr',
      roleEn: 'Sample roleEn',
      company: 'Sample company',
      email: 'ref@example.com',
      phone: 'Sample phone',
      sortOrder: 0,
      ownerId: 'user_1',
    });
    expect(item.ownerId).toBe('user_1');
    expect(item.name).toBe('Sample name');
  });
});
