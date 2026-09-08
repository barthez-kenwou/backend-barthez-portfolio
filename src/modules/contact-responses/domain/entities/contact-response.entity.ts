/**
 * Contact Response domain entity — inbound contact form messages.
 * No ownerId on the Prisma model.
 */

export type ContactResponseStatus = 'new' | 'read' | 'archived' | 'replied';

export type ContactResponseEntity = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactResponseStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type CreateContactResponseInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
  status?: ContactResponseStatus;
  notes?: string | null;
};

export type UpdateContactResponseInput = Partial<{
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactResponseStatus;
  notes: string | null;
  deletedAt: Date | null;
}>;

export type ContactResponseListFilters = {
  page: number;
  limit: number;
  status?: ContactResponseStatus;
};

export type ContactResponseListResult = {
  items: ContactResponseEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
