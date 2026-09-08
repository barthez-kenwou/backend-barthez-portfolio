/**
 * Certification domain entity — no Prisma / ORM types.
 * Infrastructure maps persistence rows to and from this shape.
 */

export type CertificationEntity = {
  id: string;
  name: string;
  issuer: string;
  year: string;
  link: string | null;
  sortOrder: number;
  ownerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type CreateCertificationInput = {
  name: string;
  issuer: string;
  year: string;
  link?: string | null;
  sortOrder?: number;
  ownerId: string;
};

export type UpdateCertificationInput = Partial<{
  name: string;
  issuer: string;
  year: string;
  link: string | null;
  sortOrder: number;
  deletedAt: Date | null;
}>;

export type CertificationListResult = {
  items: CertificationEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
