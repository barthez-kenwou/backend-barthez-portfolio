import type { UpsertContactInfoInput } from '../../domain/entities/contact-info.entity';

export type GetContactInfoDto = {
  singletonKey?: string;
};

export type UpsertContactInfoDto = UpsertContactInfoInput & {
  actorId: string;
};

export type DeleteContactInfoDto = {
  singletonKey?: string;
  actorId: string;
};
