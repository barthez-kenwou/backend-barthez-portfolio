/**
 * Experience domain entity — no Prisma / ORM types.
 * Infrastructure maps persistence rows to and from this shape.
 */

export type ExperienceEntity = {
  id: string;
  titleFr: string;
  titleEn: string;
  companyFr: string;
  companyEn: string;
  period: string;
  descriptionFr: string[];
  descriptionEn: string[];
  sortOrder: number;
  ownerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type CreateExperienceInput = {
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

export type UpdateExperienceInput = Partial<{
  titleFr: string;
  titleEn: string;
  companyFr: string;
  companyEn: string;
  period: string;
  descriptionFr: string[];
  descriptionEn: string[];
  sortOrder: number;
  deletedAt: Date | null;
}>;

export type ExperienceListResult = {
  items: ExperienceEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
