import type { Prisma, ContactResponseStatus as PrismaStatus } from '@prisma/client';

import { prismaNotDeleted } from '@/shared/infrastructure/database/prisma-soft-delete';
import prisma from '@/shared/infrastructure/database/prisma.client';

import type {
  ContactResponseEntity,
  ContactResponseListFilters,
  ContactResponseListResult,
  CreateContactResponseInput,
  UpdateContactResponseInput,
} from '../../domain/entities/contact-response.entity';
import type { ContactResponseRepositoryPort } from '../../domain/repositories/contact-response.repository';
import { ContactResponseMapper } from '../persistence/contact-response.mapper';

/**
 * Mongo-backed Contact Response persistence via Prisma.
 */
export class PrismaContactResponseRepository implements ContactResponseRepositoryPort {
  async create(data: CreateContactResponseInput): Promise<ContactResponseEntity> {
    const row = await prisma.contactResponse.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        status: (data.status ?? 'new') as PrismaStatus,
        notes: data.notes ?? null,
        deletedAt: null,
      },
    });
    return ContactResponseMapper.toDomain(row);
  }

  async findById(id: string): Promise<ContactResponseEntity | null> {
    const row = await prisma.contactResponse.findFirst({
      where: { id, ...prismaNotDeleted },
    });
    return row ? ContactResponseMapper.toDomain(row) : null;
  }

  async list(filters: ContactResponseListFilters): Promise<ContactResponseListResult> {
    const where: Prisma.ContactResponseWhereInput = {
      ...prismaNotDeleted,
      ...(filters.status ? { status: filters.status } : {}),
    };

    const [rows, total] = await Promise.all([
      prisma.contactResponse.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.contactResponse.count({ where }),
    ]);

    return {
      items: rows.map(ContactResponseMapper.toDomain),
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit) || 0,
    };
  }

  async update(id: string, data: UpdateContactResponseInput): Promise<ContactResponseEntity> {
    const row = await prisma.contactResponse.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.subject !== undefined ? { subject: data.subject } : {}),
        ...(data.message !== undefined ? { message: data.message } : {}),
        ...(data.status !== undefined ? { status: data.status as PrismaStatus } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        ...(data.deletedAt !== undefined ? { deletedAt: data.deletedAt } : {}),
      },
    });
    return ContactResponseMapper.toDomain(row);
  }
}
