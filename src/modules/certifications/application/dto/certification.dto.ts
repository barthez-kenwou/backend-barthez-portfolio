export type CreateCertificationDto = {
  name: string;
  issuer: string;
  year: string;
  link?: string;
  sortOrder?: number;
  ownerId: string;
};

export type UpdateCertificationDto = {
  id: string;
  actorId: string;
  isAdmin: boolean;
  name?: string;
  issuer?: string;
  year?: string;
  link?: string | null;
  sortOrder?: number;
};

export type DeleteCertificationDto = {
  id: string;
  actorId: string;
  isAdmin: boolean;
};

export type GetCertificationDto = {
  id: string;
};

export type ListCertificationsDto = {
  page: number;
  limit: number;
};
