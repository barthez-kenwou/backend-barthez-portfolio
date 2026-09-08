export type CreateServiceDto = {
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

export type UpdateServiceDto = {
  id: string;
  actorId: string;
  isAdmin: boolean;
  iconKey?: string;
  titleFr?: string;
  titleEn?: string;
  descFr?: string;
  descEn?: string;
  featuresFr?: string[];
  featuresEn?: string[];
  priceEur?: number;
  hourly?: boolean;
  priceFr?: string;
  priceEn?: string;
  sortOrder?: number;
  isPublished?: boolean;
};

export type DeleteServiceDto = {
  id: string;
  actorId: string;
  isAdmin: boolean;
};

export type GetServiceDto = {
  id: string;
};

export type ListServicesDto = {
  page: number;
  limit: number;
};
