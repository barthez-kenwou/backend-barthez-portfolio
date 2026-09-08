export type CreateSkillDto = {
  name: string;
  category: string;
  level: number;
  icon: string;
  sortOrder?: number;
  ownerId: string;
};

export type UpdateSkillDto = {
  id: string;
  actorId: string;
  isAdmin: boolean;
  name?: string;
  category?: string;
  level?: number;
  icon?: string;
  sortOrder?: number;
};

export type DeleteSkillDto = {
  id: string;
  actorId: string;
  isAdmin: boolean;
};

export type GetSkillDto = {
  id: string;
};

export type ListSkillsDto = {
  page: number;
  limit: number;
};
