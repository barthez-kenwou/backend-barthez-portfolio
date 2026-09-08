import type { BlogEntity } from '../../domain/entities/blog.entity';

/**
 * Optional side-effect when a blog becomes publicly published.
 * Wired to the newsletter fan-out in the composition root.
 */
export type BlogPublishedNotifyPort = {
  onBlogPublished(blog: BlogEntity): Promise<void>;
};
