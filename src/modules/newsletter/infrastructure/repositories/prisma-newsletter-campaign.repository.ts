import type { Prisma } from '@prisma/client';

import { prismaNotDeleted } from '@/shared/infrastructure/database/prisma-soft-delete';
import prisma from '@/shared/infrastructure/database/prisma.client';

import type {
  CreateNewsletterCampaignInput,
  NewsletterCampaignEntity,
  NewsletterCampaignListResult,
  NewsletterCampaignStatus,
  NewsletterCampaignType,
  UpdateNewsletterCampaignInput,
} from '../../domain/entities/newsletter.entity';
import type { NewsletterCampaignRepositoryPort } from '../../domain/repositories/newsletter.repository';
import { NewsletterMapper } from '../persistence/newsletter.mapper';

export class PrismaNewsletterCampaignRepository implements NewsletterCampaignRepositoryPort {
  async create(data: CreateNewsletterCampaignInput): Promise<NewsletterCampaignEntity> {
    const row = await prisma.newsletterCampaign.create({
      data: {
        type: data.type,
        status: data.status ?? 'queued',
        subjectFr: data.subjectFr,
        subjectEn: data.subjectEn,
        previewFr: data.previewFr ?? null,
        previewEn: data.previewEn ?? null,
        template: data.template,
        payload: (data.payload ?? undefined) as Prisma.InputJsonValue | undefined,
        blogId: data.blogId ?? null,
        createdById: data.createdById ?? null,
        totalRecipients: data.totalRecipients ?? 0,
        deletedAt: null,
      },
    });
    return NewsletterMapper.campaignToDomain(row);
  }

  async findById(id: string): Promise<NewsletterCampaignEntity | null> {
    const row = await prisma.newsletterCampaign.findFirst({
      where: { id, ...prismaNotDeleted },
    });
    return row ? NewsletterMapper.campaignToDomain(row) : null;
  }

  async findRecentByBlog(
    blogId: string,
    type: NewsletterCampaignType,
  ): Promise<NewsletterCampaignEntity | null> {
    const row = await prisma.newsletterCampaign.findFirst({
      where: { blogId, type, ...prismaNotDeleted },
      orderBy: { createdAt: 'desc' },
    });
    return row ? NewsletterMapper.campaignToDomain(row) : null;
  }

  async list(input: {
    page: number;
    limit: number;
    type?: NewsletterCampaignType;
    status?: NewsletterCampaignStatus;
  }): Promise<NewsletterCampaignListResult> {
    const where: Record<string, unknown> = { ...prismaNotDeleted };
    if (input.type) where.type = input.type;
    if (input.status) where.status = input.status;

    const [rows, total] = await Promise.all([
      prisma.newsletterCampaign.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      prisma.newsletterCampaign.count({ where }),
    ]);

    return {
      items: rows.map(NewsletterMapper.campaignToDomain),
      total,
      page: input.page,
      limit: input.limit,
      totalPages: Math.ceil(total / input.limit) || 0,
    };
  }

  async update(id: string, data: UpdateNewsletterCampaignInput): Promise<NewsletterCampaignEntity> {
    const patch: Prisma.NewsletterCampaignUpdateInput = {
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.totalRecipients !== undefined ? { totalRecipients: data.totalRecipients } : {}),
      ...(data.sentCount !== undefined ? { sentCount: data.sentCount } : {}),
      ...(data.failCount !== undefined ? { failCount: data.failCount } : {}),
      ...(data.startedAt !== undefined ? { startedAt: data.startedAt } : {}),
      ...(data.completedAt !== undefined ? { completedAt: data.completedAt } : {}),
      ...(data.deletedAt !== undefined ? { deletedAt: data.deletedAt } : {}),
    };

    if (data.payload) {
      patch.payload = data.payload as Prisma.InputJsonValue;
    }

    const row = await prisma.newsletterCampaign.update({
      where: { id },
      data: patch,
    });
    return NewsletterMapper.campaignToDomain(row);
  }

  async incrementCounters(
    id: string,
    delta: { sent?: number; fail?: number },
  ): Promise<NewsletterCampaignEntity> {
    const row = await prisma.newsletterCampaign.update({
      where: { id },
      data: {
        ...(delta.sent ? { sentCount: { increment: delta.sent } } : {}),
        ...(delta.fail ? { failCount: { increment: delta.fail } } : {}),
      },
    });
    return NewsletterMapper.campaignToDomain(row);
  }
}
