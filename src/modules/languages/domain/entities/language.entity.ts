/**
 * Language domain entity — no Prisma / ORM types.
 * Infrastructure maps persistence rows to and from this shape.
 */

export type LanguageEntity = {
  id: string;
  language: string;
  proficiencyFr: string;
  proficiencyEn: string;
  sortOrder: number;
  ownerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type CreateLanguageInput = {
  language: string;
  proficiencyFr: string;
  proficiencyEn: string;
  sortOrder?: number;
  ownerId: string;
};

export type UpdateLanguageInput = Partial<{
  language: string;
  proficiencyFr: string;
  proficiencyEn: string;
  sortOrder: number;
  deletedAt: Date | null;
}>;

export type LanguageListResult = {
  items: LanguageEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
