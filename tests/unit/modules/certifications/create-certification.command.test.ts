import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateCertificationCommand } from '@/modules/certifications/application/commands/create-certification.command';
import type { CertificationRepositoryPort } from '@/modules/certifications/domain/repositories/certification.repository';

describe('CreateCertificationCommand', () => {
  let certificationRepository: CertificationRepositoryPort;
  let command: CreateCertificationCommand;

  beforeEach(() => {
    certificationRepository = {
      create: vi.fn().mockImplementation(async (input) => ({
        id: '507f1f77bcf86cd799439011',
        name: input.name,
        issuer: input.issuer,
        year: input.year,
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

    command = new CreateCertificationCommand({ certificationRepository });
  });

  it('creates a certification for the owner', async () => {
    const item = await command.execute({
      name: '  Sample name  ',
      issuer: '  Sample issuer  ',
      year: '  Sample year  ',
      ownerId: 'user_1',
    });

    expect(certificationRepository.create).toHaveBeenCalledWith({
      name: 'Sample name',
      issuer: 'Sample issuer',
      year: 'Sample year',
      link: null,
      sortOrder: 0,
      ownerId: 'user_1',
    });
    expect(item.ownerId).toBe('user_1');
    expect(item.name).toBe('Sample name');
  });
});
