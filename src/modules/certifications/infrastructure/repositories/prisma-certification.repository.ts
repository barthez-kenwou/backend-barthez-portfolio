import { prismaNotDeleted } from '@/shared/infrastructure/database/prisma-soft-delete';
import prisma from '@/shared/infrastructure/database/prisma.client';

import type {
  CertificationEntity,
  CertificationListResult,
  CreateCertificationInput,
  UpdateCertificationInput,
} from '../../domain/entities/certification.entity';
import type { CertificationRepositoryPort } from '../../domain/repositories/certification.repository';
import { CertificationMapper } from '../persistence/certification.mapper';

/**
 * Mongo-backed Certification persistence via Prisma.
 */
export class PrismaCertificationRepository implements CertificationRepositoryPort {
  async create(data: CreateCertificationInput): Promise<CertificationEntity> {
    const row = await prisma.certification.create({
      data: {
        name: data.name,
        issuer: data.issuer,
        year: data.year,
        link: data.link ?? null,
        sortOrder: data.sortOrder ?? 0,
        ownerId: data.ownerId,
        deletedAt: null,
      },
    });
    return CertificationMapper.toDomain(row);
  }

  async findById(id: string): Promise<CertificationEntity | null> {
    const row = await prisma.certification.findFirst({
      where: { id, ...prismaNotDeleted },
    });
    return row ? CertificationMapper.toDomain(row) : null;
  }

  async list(page: number, limit: number): Promise<CertificationListResult> {
    const where = { ...prismaNotDeleted };
    const [rows, total] = await Promise.all([
      prisma.certification.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.certification.count({ where }),
    ]);

    return {
      items: rows.map(CertificationMapper.toDomain),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
    };
  }

  async update(id: string, data: UpdateCertificationInput): Promise<CertificationEntity> {
    const row = await prisma.certification.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.issuer !== undefined ? { issuer: data.issuer } : {}),
        ...(data.year !== undefined ? { year: data.year } : {}),
        ...(data.link !== undefined ? { link: data.link } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
        ...(data.deletedAt !== undefined ? { deletedAt: data.deletedAt } : {}),
      },
    });
    return CertificationMapper.toDomain(row);
  }
}
