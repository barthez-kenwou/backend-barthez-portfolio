import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateBlogCommand } from '@/modules/blog/application/commands/create-blog.command';
import type { BlogRepositoryPort } from '@/modules/blog/domain/repositories/blog.repository';

import { buildBlogEntity } from '../../../factories/blog.factory';

describe('CreateBlogCommand', () => {
  let blogRepository: BlogRepositoryPort;
  let cache: { invalidatePattern: ReturnType<typeof vi.fn> };
  let command: CreateBlogCommand;

  beforeEach(() => {
    blogRepository = {
      create: vi.fn().mockImplementation(async (input) =>
        buildBlogEntity({
          titleFr: input.titleFr,
          titleEn: input.titleEn,
          slug: input.slug,
          authorId: input.authorId,
          author: input.author,
        }),
      ),
      update: vi.fn(),
      findById: vi.fn(),
      findPublicBySlug: vi.fn(),
      listPublic: vi.fn(),
      findPublicByIds: vi.fn(),
    };

    cache = { invalidatePattern: vi.fn().mockResolvedValue(undefined) };
    command = new CreateBlogCommand({ blogRepository, cache });
  });

  it('creates an unpublished post with slugify(titleEn)+timestamp and invalidates cache', async () => {
    const blog = await command.execute({
      titleFr: 'Bonjour le monde !',
      titleEn: 'Hello World!',
      excerptFr: 'Extrait FR',
      excerptEn: 'Excerpt EN',
      contentFr: 'Contenu FR assez long',
      contentEn: 'Content EN long enough',
      image: 'https://cdn.example.com/a.jpg',
      category: 'engineering',
      date: new Date('2026-01-15T00:00:00.000Z'),
      readTime: '4 min',
      author: 'Barthez',
      authorId: 'user_1',
    });

    expect(blogRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        titleEn: 'Hello World!',
        titleFr: 'Bonjour le monde !',
        authorId: 'user_1',
        author: 'Barthez',
        slug: expect.stringMatching(/^hello-world-/),
      }),
    );
    expect(cache.invalidatePattern).toHaveBeenCalledWith('blogs:*');
    expect(blog.titleEn).toBe('Hello World!');
  });

  it('uses an explicit slug from the body when provided', async () => {
    await command.execute({
      slug: 'custom-slug',
      titleFr: 'Titre',
      titleEn: 'Title',
      excerptFr: 'Extrait FR',
      excerptEn: 'Excerpt EN',
      contentFr: 'Contenu FR assez long',
      contentEn: 'Content EN long enough',
      image: 'https://cdn.example.com/a.jpg',
      category: 'engineering',
      date: '2026-01-15T00:00:00.000Z',
      readTime: '4 min',
      author: 'Barthez',
      authorId: 'user_1',
    });

    expect(blogRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'custom-slug' }),
    );
  });
});
