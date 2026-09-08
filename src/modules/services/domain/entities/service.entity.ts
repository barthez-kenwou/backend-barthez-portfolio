/**
 * Service domain entity — no Prisma / ORM types.
 * Infrastructure maps persistence rows to and from this shape.
 */

export type ServiceEntity = {
  id: string;
  iconKey: string;
  titleFr: string;
  titleEn: string;
  descFr: string;
  descEn: string;
  featuresFr: string[];
  featuresEn: string[];
  priceEur: number;
  hourly: boolean;
  priceFr: string;
  priceEn: string;
  sortOrder: number;
  isPublished: boolean;
  ownerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type CreateServiceInput = {
  iconKey: string;
  titleFr: string;
  titleEn: string;
  descFr: string;
  descEn: string;
  featuresFr: string[];
  featuresEn: string[];
  priceEur: number;
  hourly?: boolean;
  priceFr: string;
  priceEn: string;
  sortOrder?: number;
  isPublished?: boolean;
  ownerId: string;
};

export type UpdateServiceInput = Partial<{
  iconKey: string;
  titleFr: string;
  titleEn: string;
  descFr: string;
  descEn: string;
  featuresFr: string[];
  featuresEn: string[];
  priceEur: number;
  hourly: boolean;
  priceFr: string;
  priceEn: string;
  sortOrder: number;
  isPublished: boolean;
  deletedAt: Date | null;
}>;

export type ServiceListResult = {
  items: ServiceEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
