import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PublishBlogCommand } from '@/modules/blog/application/commands/publish-blog.command';
import { UpdateBlogCommand } from '@/modules/blog/application/commands/update-blog.command';
import { BlogForbiddenError, BlogNotFoundError } from '@/modules/blog/domain/errors/blog.errors';
import type { BlogRepositoryPort } from '@/modules/blog/domain/repositories/blog.repository';
import { AppError } from '@/shared/domain/errors/app-error';

import { buildBlogEntity } from '../../../factories/blog.factory';

describe('blog IDOR / ownership guards', () => {
  let blogRepository: BlogRepositoryPort;

  beforeEach(() => {
    blogRepository = {
      create: vi.fn(),
      update: vi
        .fn()
        .mockImplementation(async (id, data) =>
          buildBlogEntity({ id, ...data, authorId: 'owner_1' }),
        ),
      findById: vi.fn(),
      findPublicBySlug: vi.fn(),
      listPublic: vi.fn(),
      findPublicByIds: vi.fn(),
    };
  });

  it('BlogForbiddenError is thrown for non-owner non-admin updates', async () => {
    vi.mocked(blogRepository.findById).mockResolvedValue(
      buildBlogEntity({ id: 'b1', authorId: 'owner_1' }),
    );

    const command = new UpdateBlogCommand({ blogRepository });

    await expect(
      command.execute({
        id: 'b1',
        authorId: 'intruder',
        isAdmin: false,
        titleEn: 'Hacked',
      }),
    ).rejects.toBeInstanceOf(BlogForbiddenError);
  });

  it('ownerless blogs require :any elevation to mutate', async () => {
    vi.mocked(blogRepository.findById).mockResolvedValue(
      buildBlogEntity({ id: 'b2', authorId: null }),
    );

    const command = new PublishBlogCommand({ blogRepository });

    await expect(
      command.execute({ id: 'b2', authorId: 'user_x', isAdmin: false }),
    ).rejects.toBeInstanceOf(BlogForbiddenError);

    await expect(
      command.execute({ id: 'b2', authorId: 'user_x', isAdmin: true }),
    ).resolves.toMatchObject({ isPublished: true });

    expect(blogRepository.update).toHaveBeenCalledWith('b2', { isPublished: true });
  });

  it('BlogNotFoundError maps to 404', () => {
    const error = new BlogNotFoundError();
    expect(error.statusCode).toBe(404);
    expect(error).toBeInstanceOf(AppError);
  });
});
