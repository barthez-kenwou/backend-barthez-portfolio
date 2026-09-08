export type CreateExperienceDto = {
  titleFr: string;
  titleEn: string;
  companyFr: string;
  companyEn: string;
  period: string;
  descriptionFr: string[];
  descriptionEn: string[];
  sortOrder?: number;
  ownerId: string;
};

export type UpdateExperienceDto = {
  id: string;
  actorId: string;
  isAdmin: boolean;
  titleFr?: string;
  titleEn?: string;
  companyFr?: string;
  companyEn?: string;
  period?: string;
  descriptionFr?: string[];
  descriptionEn?: string[];
  sortOrder?: number;
};

export type DeleteExperienceDto = {
  id: string;
  actorId: string;
  isAdmin: boolean;
};

export type GetExperienceDto = {
  id: string;
};

export type ListExperiencesDto = {
  page: number;
  limit: number;
};
