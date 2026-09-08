export type CreateAchievementDto = {
  iconKey: string;
  value: string;
  labelFr: string;
  labelEn: string;
  sortOrder?: number;
  ownerId: string;
};

export type UpdateAchievementDto = {
  id: string;
  actorId: string;
  isAdmin: boolean;
  iconKey?: string;
  value?: string;
  labelFr?: string;
  labelEn?: string;
  sortOrder?: number;
};

export type DeleteAchievementDto = {
  id: string;
  actorId: string;
  isAdmin: boolean;
};

export type GetAchievementDto = {
  id: string;
};

export type ListAchievementsDto = {
  page: number;
  limit: number;
};
