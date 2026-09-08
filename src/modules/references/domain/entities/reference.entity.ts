/**
 * Reference domain entity — no Prisma / ORM types.
 * Infrastructure maps persistence rows to and from this shape.
 */

export type ReferenceEntity = {
  id: string;
  name: string;
  roleFr: string;
  roleEn: string;
  company: string;
  email: string;
  phone: string;
  sortOrder: number;
  ownerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type CreateReferenceInput = {
  name: string;
  roleFr: string;
  roleEn: string;
  company: string;
  email: string;
  phone: string;
  sortOrder?: number;
  ownerId: string;
};

export type UpdateReferenceInput = Partial<{
  name: string;
  roleFr: string;
  roleEn: string;
  company: string;
  email: string;
  phone: string;
  sortOrder: number;
  deletedAt: Date | null;
}>;

export type ReferenceListResult = {
  items: ReferenceEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
