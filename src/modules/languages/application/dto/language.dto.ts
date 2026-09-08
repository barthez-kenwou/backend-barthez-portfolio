export type CreateLanguageDto = {
  language: string;
  proficiencyFr: string;
  proficiencyEn: string;
  sortOrder?: number;
  ownerId: string;
};

export type UpdateLanguageDto = {
  id: string;
  actorId: string;
  isAdmin: boolean;
  language?: string;
  proficiencyFr?: string;
  proficiencyEn?: string;
  sortOrder?: number;
};

export type DeleteLanguageDto = {
  id: string;
  actorId: string;
  isAdmin: boolean;
};

export type GetLanguageDto = {
  id: string;
};

export type ListLanguagesDto = {
  page: number;
  limit: number;
};
