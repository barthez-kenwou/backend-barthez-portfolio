import type { BlogEntity } from '@/modules/blog/domain/entities/blog.entity';

import { type NewsletterUtm, WELCOME_FLAGSHIP_SLUG, buildBlogPostUrl } from './newsletter-links';

export type WelcomeBlogSourcePort = {
  findPublishedBySlug(slug: string): Promise<BlogEntity | null>;
  /** Most viewed published post; optional category filter. */
  findTopViewedPublished(category?: string): Promise<BlogEntity | null>;
};

export type WelcomeResource = {
  slug: string;
  category: string;
  titleFr: string;
  titleEn: string;
  /** How we picked it — for logs / campaign payload. */
  resolution: 'category-top' | 'global-top' | 'flagship';
};

const FLAGSHIP_FALLBACK: WelcomeResource = {
  slug: WELCOME_FLAGSHIP_SLUG,
  category: 'CI/CD',
  titleFr: 'CI/CD GitHub Actions — de zéro à un pipeline fiable',
  titleEn: 'CI/CD with GitHub Actions — from zero to a reliable pipeline',
  resolution: 'flagship',
};

/**
 * Parse signup source.
 * - `blog:my-slug` or `blog_my-slug` → article context
 * - anything else → generic channel (blog, services, linkedin…)
 */
export function parseBlogSlugFromSource(source: string | null | undefined): string | null {
  if (!source) return null;
  const trimmed = source.trim();
  const colon = trimmed.match(/^blog:(.+)$/i);
  if (colon?.[1]) return colon[1].trim().slice(0, 80) || null;
  const underscore = trimmed.match(/^blog_(.+)$/i);
  if (underscore?.[1]) return underscore[1].trim().slice(0, 80) || null;
  return null;
}

function toResource(blog: BlogEntity, resolution: WelcomeResource['resolution']): WelcomeResource {
  return {
    slug: blog.slug,
    category: blog.category,
    titleFr: blog.titleFr,
    titleEn: blog.titleEn,
    resolution,
  };
}

/**
 * Pick the welcome deep-link resource:
 * 1. Subscriber came from article X → most-viewed published post in X's category
 * 2. Else → most-viewed published post overall
 * 3. Else → hardcoded flagship slug
 */
export async function resolveWelcomeResource(
  source: string | null | undefined,
  blogSource: WelcomeBlogSourcePort,
): Promise<WelcomeResource> {
  const originSlug = parseBlogSlugFromSource(source);

  if (originSlug) {
    const origin = await blogSource.findPublishedBySlug(originSlug);
    if (origin?.category) {
      const topInCategory = await blogSource.findTopViewedPublished(origin.category);
      if (topInCategory) return toResource(topInCategory, 'category-top');
      return toResource(origin, 'category-top');
    }
  }

  const globalTop = await blogSource.findTopViewedPublished();
  if (globalTop) return toResource(globalTop, 'global-top');

  return FLAGSHIP_FALLBACK;
}

export function buildWelcomeResourceUrl(resource: WelcomeResource, utm: NewsletterUtm): string {
  return buildBlogPostUrl(resource.slug, utm);
}
