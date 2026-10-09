import type {
  BlogEntity,
  BlogListResult,
  CreateBlogInput,
  UpdateBlogInput,
} from '../entities/blog.entity';

/**
 * Port for blog persistence required by blog use cases.
 * Infrastructure provides a Prisma implementation.
 */
export interface BlogRepositoryPort {
  create(data: CreateBlogInput): Promise<BlogEntity>;

  findById(id: string): Promise<BlogEntity | null>;

  findPublicBySlug(slug: string): Promise<BlogEntity | null>;

  /** Any publish state (admin editor / draft preview). Soft-deleted excluded. */
  findBySlug(slug: string): Promise<BlogEntity | null>;

  listPublic(page: number, limit: number): Promise<BlogListResult>;

  /** Admin CMS list — includes drafts when `includeUnpublished` is true. */
  listAll(page: number, limit: number, includeUnpublished: boolean): Promise<BlogListResult>;

  /** Fetch published blogs by id (isPublished=true; preserves search result order). */
  findPublicByIds(ids: string[]): Promise<BlogEntity[]>;

  update(id: string, data: UpdateBlogInput): Promise<BlogEntity>;
}
