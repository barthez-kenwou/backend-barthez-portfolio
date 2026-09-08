export type CreateBlogDto = {
  slug?: string;
  titleFr: string;
  titleEn: string;
  excerptFr: string;
  excerptEn: string;
  contentFr: string;
  contentEn: string;
  image: string;
  category: string;
  date: Date | string;
  readTime: string;
  author: string;
  tags?: string[];
  /** Authenticated user id — stored as optional authorId on the model. */
  authorId: string;
  /** When true, post is immediately public. Defaults to false (draft). */
  isPublished?: boolean;
};

export type UpdateBlogDto = {
  id: string;
  authorId: string;
  isAdmin: boolean;
  slug?: string;
  titleFr?: string;
  titleEn?: string;
  excerptFr?: string;
  excerptEn?: string;
  contentFr?: string;
  contentEn?: string;
  image?: string;
  category?: string;
  date?: Date | string;
  readTime?: string;
  author?: string;
  tags?: string[];
  isPublished?: boolean;
};

export type PublishBlogDto = {
  id: string;
  authorId: string;
  isAdmin: boolean;
};

export type DeleteBlogDto = {
  id: string;
  authorId: string;
  isAdmin: boolean;
};

export type GetBlogBySlugDto = {
  slug: string;
};

export type ListPublicBlogsDto = {
  page: number;
  limit: number;
};
