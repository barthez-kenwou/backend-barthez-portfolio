import type {
  ContactResponseStatus,
  UpdateContactResponseInput,
} from '../../domain/entities/contact-response.entity';

/** Public contact form submit (no auth). */
export type SubmitContactResponseDto = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type UpdateContactResponseDto = UpdateContactResponseInput & {
  id: string;
  actorId: string;
};

export type DeleteContactResponseDto = {
  id: string;
  actorId: string;
};

export type GetContactResponseDto = {
  id: string;
  /** When true, mark `new` → `read` before returning. */
  markReadIfNew?: boolean;
};

export type ListContactResponsesDto = {
  page: number;
  limit: number;
  status?: ContactResponseStatus;
};
