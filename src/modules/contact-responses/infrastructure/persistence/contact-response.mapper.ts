import type { ContactResponse as PrismaContactResponse } from '@prisma/client';

import type {
  ContactResponseEntity,
  ContactResponseStatus,
} from '../../domain/entities/contact-response.entity';

/**
 * Maps Prisma ContactResponse rows ↔ domain ContactResponseEntity.
 */
export const ContactResponseMapper = {
  toDomain(row: PrismaContactResponse): ContactResponseEntity {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      subject: row.subject,
      message: row.message,
      status: row.status as ContactResponseStatus,
      notes: row.notes ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? null,
    };
  },
};
