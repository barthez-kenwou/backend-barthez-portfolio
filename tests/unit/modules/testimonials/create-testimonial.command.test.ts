import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateTestimonialCommand } from '@/modules/testimonials/application/commands/create-testimonial.command';
import type { TestimonialRepositoryPort } from '@/modules/testimonials/domain/repositories/testimonial.repository';

describe('CreateTestimonialCommand', () => {
  let testimonialRepository: TestimonialRepositoryPort;
  let command: CreateTestimonialCommand;

  beforeEach(() => {
    testimonialRepository = {
      create: vi.fn().mockImplementation(async (input) => ({
        id: '507f1f77bcf86cd799439011',
        ...input,
        company: input.company ?? null,
        email: input.email ?? null,
        isPublished: input.isPublished ?? false,
        status: input.status ?? 'pending',
        source: input.source ?? 'admin',
        sortOrder: input.sortOrder ?? 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })),
      findById: vi.fn(),
      list: vi.fn(),
      listPublic: vi.fn(),
      update: vi.fn(),
    };

    command = new CreateTestimonialCommand({ testimonialRepository });
  });

  it('creates a testimonial for the owner', async () => {
    const item = await command.execute({
      rating: 5,
      textFr: '  Excellent travail  ',
      textEn: '  Excellent work  ',
      nameFr: 'Alice',
      nameEn: 'Alice',
      roleFr: 'CTO',
      roleEn: 'CTO',
      company: 'Acme',
      actorId: 'user_1',
      ownerId: 'user_1',
      isPublished: true,
      status: 'approved',
      source: 'admin',
    });

    expect(testimonialRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        rating: 5,
        textFr: 'Excellent travail',
        textEn: 'Excellent work',
        nameFr: 'Alice',
        ownerId: 'user_1',
        source: 'admin',
      }),
    );
    expect(item.rating).toBe(5);
    expect(item.textEn).toBe('Excellent work');
  });
});
