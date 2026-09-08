/**
 * Achievement domain entity — no Prisma / ORM types.
 * Infrastructure maps persistence rows to and from this shape.
 */

export type AchievementEntity = {
  id: string;
  iconKey: string;
  value: string;
  labelFr: string;
  labelEn: string;
  sortOrder: number;
  ownerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type CreateAchievementInput = {
  iconKey: string;
  value: string;
  labelFr: string;
  labelEn: string;
  sortOrder?: number;
  ownerId: string;
};

export type UpdateAchievementInput = Partial<{
  iconKey: string;
  value: string;
  labelFr: string;
  labelEn: string;
  sortOrder: number;
  deletedAt: Date | null;
}>;

export type AchievementListResult = {
  items: AchievementEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
