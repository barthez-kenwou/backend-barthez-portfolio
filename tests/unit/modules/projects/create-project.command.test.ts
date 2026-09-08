import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateProjectCommand } from '@/modules/projects/application/commands/create-project.command';
import type { ProjectRepositoryPort } from '@/modules/projects/domain/repositories/project.repository';

const baseInput = {
  titleFr: '  Projet Démo  ',
  titleEn: '  Demo Project  ',
  descriptionFr: 'Desc FR',
  descriptionEn: 'Desc EN',
  problemFr: 'Problem FR',
  problemEn: 'Problem EN',
  solutionFr: ['Solution FR'],
  solutionEn: ['Solution EN'],
  impactFr: ['Impact FR'],
  impactEn: ['Impact EN'],
  techStack: { frontend: ['React'], backend: ['Node'] },
  images: ['https://cdn.example.com/p1.png'],
  preview: 'https://cdn.example.com/preview.png',
  category: 'Web',
  status: 'Production',
  complexity: 'Avancé',
  role: 'Full Stack Developer',
  duration: '3 months',
  date: '2025-01',
  ownerId: 'user_1',
};

describe('CreateProjectCommand', () => {
  let projectRepository: ProjectRepositoryPort;
  let command: CreateProjectCommand;

  beforeEach(() => {
    projectRepository = {
      create: vi.fn().mockImplementation(async (input) => ({
        id: '507f1f77bcf86cd799439011',
        ...input,
        isFeatured: input.isFeatured ?? false,
        isPublished: input.isPublished ?? false,
        confidential: input.confidential ?? false,
        sortOrder: input.sortOrder ?? 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })),
      findById: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
    };

    command = new CreateProjectCommand({ projectRepository });
  });

  it('creates a project for the owner', async () => {
    const item = await command.execute(baseInput);

    expect(projectRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        titleFr: 'Projet Démo',
        titleEn: 'Demo Project',
        ownerId: 'user_1',
        category: 'Web',
      }),
    );
    expect(item.ownerId).toBe('user_1');
    expect(item.titleEn).toBe('Demo Project');
  });
});
