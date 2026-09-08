import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateServiceCommand } from '@/modules/services/application/commands/create-service.command';
import type { ServiceRepositoryPort } from '@/modules/services/domain/repositories/service.repository';

describe('CreateServiceCommand', () => {
  let serviceRepository: ServiceRepositoryPort;
  let command: CreateServiceCommand;

  beforeEach(() => {
    serviceRepository = {
      create: vi.fn().mockImplementation(async (input) => ({
        id: '507f1f77bcf86cd799439011',
        iconKey: input.iconKey,
        titleFr: input.titleFr,
        titleEn: input.titleEn,
        descFr: input.descFr,
        descEn: input.descEn,
        featuresFr: input.featuresFr ?? [],
        featuresEn: input.featuresEn ?? [],
        priceEur: input.priceEur,
        hourly: input.hourly ?? false,
        priceFr: input.priceFr,
        priceEn: input.priceEn,
        sortOrder: input.sortOrder ?? 0,
        isPublished: input.isPublished ?? true,
        ownerId: input.ownerId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })),
      findById: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
    };

    command = new CreateServiceCommand({ serviceRepository });
  });

  it('creates a service for the owner', async () => {
    const item = await command.execute({
      iconKey: '  Sample iconKey  ',
      titleFr: '  Sample titleFr  ',
      titleEn: '  Sample titleEn  ',
      descFr: '  Sample descFr  ',
      descEn: '  Sample descEn  ',
      featuresFr: ['  one  ', 'two'],
      featuresEn: ['  one  ', 'two'],
      priceEur: 50,
      priceFr: '  Sample priceFr  ',
      priceEn: '  Sample priceEn  ',
      ownerId: 'user_1',
    });

    expect(serviceRepository.create).toHaveBeenCalledWith({
      iconKey: 'Sample iconKey',
      titleFr: 'Sample titleFr',
      titleEn: 'Sample titleEn',
      descFr: 'Sample descFr',
      descEn: 'Sample descEn',
      featuresFr: ['one', 'two'],
      featuresEn: ['one', 'two'],
      priceEur: 50,
      hourly: false,
      priceFr: 'Sample priceFr',
      priceEn: 'Sample priceEn',
      sortOrder: 0,
      isPublished: true,
      ownerId: 'user_1',
    });
    expect(item.ownerId).toBe('user_1');
    expect(item.iconKey).toBe('Sample iconKey');
  });
});
