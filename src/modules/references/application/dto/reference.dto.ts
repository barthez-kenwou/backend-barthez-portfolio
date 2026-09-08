export type CreateReferenceDto = {
  name: string;
  roleFr: string;
  roleEn: string;
  company: string;
  email: string;
  phone: string;
  sortOrder?: number;
  ownerId: string;
};

export type UpdateReferenceDto = {
  id: string;
  actorId: string;
  isAdmin: boolean;
  name?: string;
  roleFr?: string;
  roleEn?: string;
  company?: string;
  email?: string;
  phone?: string;
  sortOrder?: number;
};

export type DeleteReferenceDto = {
  id: string;
  actorId: string;
  isAdmin: boolean;
};

export type GetReferenceDto = {
  id: string;
};

export type ListReferencesDto = {
  page: number;
  limit: number;
};
