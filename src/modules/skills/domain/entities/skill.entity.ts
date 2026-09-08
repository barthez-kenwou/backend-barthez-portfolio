/**
 * Skill domain entity — no Prisma / ORM types.
 * Infrastructure maps persistence rows to and from this shape.
 */

export type SkillEntity = {
  id: string;
  name: string;
  category: string;
  level: number;
  icon: string;
  sortOrder: number;
  ownerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type CreateSkillInput = {
  name: string;
  category: string;
  level: number;
  icon: string;
  sortOrder?: number;
  ownerId: string;
};

export type UpdateSkillInput = Partial<{
  name: string;
  category: string;
  level: number;
  icon: string;
  sortOrder: number;
  deletedAt: Date | null;
}>;

export type SkillListResult = {
  items: SkillEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
