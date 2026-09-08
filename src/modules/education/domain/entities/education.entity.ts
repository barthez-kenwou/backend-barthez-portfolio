/**
 * Education domain entity — no Prisma / ORM types.
 * Infrastructure maps persistence rows to and from this shape.
 */

export type EducationEntity = {
  id: string;
  degreeFr: string;
  degreeEn: string;
  school: string;
  period: string;
  link: string | null;
  sortOrder: number;
  ownerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type CreateEducationInput = {
  degreeFr: string;
  degreeEn: string;
  school: string;
  period: string;
  link?: string | null;
  sortOrder?: number;
  ownerId: string;
};

export type UpdateEducationInput = Partial<{
  degreeFr: string;
  degreeEn: string;
  school: string;
  period: string;
  link: string | null;
  sortOrder: number;
  deletedAt: Date | null;
}>;

export type EducationListResult = {
  items: EducationEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
