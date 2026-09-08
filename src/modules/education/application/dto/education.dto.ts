export type CreateEducationDto = {
  degreeFr: string;
  degreeEn: string;
  school: string;
  period: string;
  link?: string;
  sortOrder?: number;
  ownerId: string;
};

export type UpdateEducationDto = {
  id: string;
  actorId: string;
  isAdmin: boolean;
  degreeFr?: string;
  degreeEn?: string;
  school?: string;
  period?: string;
  link?: string | null;
  sortOrder?: number;
};

export type DeleteEducationDto = {
  id: string;
  actorId: string;
  isAdmin: boolean;
};

export type GetEducationDto = {
  id: string;
};

export type ListEducationDto = {
  page: number;
  limit: number;
};
