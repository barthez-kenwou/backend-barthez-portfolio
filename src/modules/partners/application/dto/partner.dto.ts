export type CreatePartnerDto = {
  name: string;
  logoUrl: string;
  websiteUrl?: string;
  descriptionFr?: string;
  descriptionEn?: string;
  relationFr?: string;
  relationEn?: string;
  sortOrder?: number;
  isPublished?: boolean;
  ownerId: string;
};

export type UpdatePartnerDto = {
  id: string;
  actorId: string;
  isAdmin: boolean;
  name?: string;
  logoUrl?: string;
  websiteUrl?: string | null;
  descriptionFr?: string | null;
  descriptionEn?: string | null;
  relationFr?: string | null;
  relationEn?: string | null;
  sortOrder?: number;
  isPublished?: boolean;
};

export type DeletePartnerDto = {
  id: string;
  actorId: string;
  isAdmin: boolean;
};

export type GetPartnerDto = {
  id: string;
};

export type ListPartnersDto = {
  page: number;
  limit: number;
  isPublished?: boolean;
  includeUnpublished?: boolean;
};
