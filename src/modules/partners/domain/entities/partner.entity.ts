/**
 * Partner domain entity — no Prisma / ORM types.
 */

export type PartnerEntity = {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string | null;
  descriptionFr: string | null;
  descriptionEn: string | null;
  relationFr: string | null;
  relationEn: string | null;
  sortOrder: number;
  isPublished: boolean;
  ownerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type CreatePartnerInput = {
  name: string;
  logoUrl: string;
  websiteUrl?: string | null;
  descriptionFr?: string | null;
  descriptionEn?: string | null;
  relationFr?: string | null;
  relationEn?: string | null;
  sortOrder?: number;
  isPublished?: boolean;
  ownerId: string;
};

export type UpdatePartnerInput = Partial<{
  name: string;
  logoUrl: string;
  websiteUrl: string | null;
  descriptionFr: string | null;
  descriptionEn: string | null;
  relationFr: string | null;
  relationEn: string | null;
  sortOrder: number;
  isPublished: boolean;
  deletedAt: Date | null;
}>;

export type PartnerListFilters = {
  page: number;
  limit: number;
  isPublished?: boolean;
};

export type PartnerListResult = {
  items: PartnerEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
