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
        projectId: input.projectId ?? null,
        ownerId: input.ownerId ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })),
      findById: vi.fn(),
      list: vi.fn(),
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
        projectId: null,
      }),
    );
    expect(item.rating).toBe(5);
    expect(item.textEn).toBe('Excellent work');
  });

  it('rejects an unknown projectId', async () => {
    const projectLink = {
      isLinkable: vi.fn().mockResolvedValue(false),
      setEmbedded: vi.fn(),
      clearEmbeddedIfOwnedBy: vi.fn(),
    };
    command = new CreateTestimonialCommand({ testimonialRepository, projectLink });

    await expect(
      command.execute({
        rating: 5,
        textFr: 'ok',
        textEn: 'ok',
        nameFr: 'A',
        nameEn: 'A',
        roleFr: 'Dev',
        roleEn: 'Dev',
        projectId: '507f1f77bcf86cd799439012',
        actorId: 'user_1',
      }),
    ).rejects.toMatchObject({ code: 'TESTIMONIAL_INVALID_PROJECT' });
  });

  it('mirrors onto the project when created already approved', async () => {
    const projectLink = {
      isLinkable: vi.fn().mockResolvedValue(true),
      setEmbedded: vi.fn(),
      clearEmbeddedIfOwnedBy: vi.fn(),
    };
    command = new CreateTestimonialCommand({ testimonialRepository, projectLink });

    await command.execute({
      rating: 5,
      textFr: 'Bravo',
      textEn: 'Great',
      nameFr: 'Bob',
      nameEn: 'Bob',
      roleFr: 'CEO',
      roleEn: 'CEO',
      projectId: '507f1f77bcf86cd799439012',
      isPublished: true,
      status: 'approved',
      actorId: 'user_1',
    });

    expect(projectLink.setEmbedded).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439012',
      expect.objectContaining({
        quoteFr: 'Bravo',
        quoteEn: 'Great',
        author: 'Bob',
        testimonialId: '507f1f77bcf86cd799439011',
      }),
    );
  });
});
