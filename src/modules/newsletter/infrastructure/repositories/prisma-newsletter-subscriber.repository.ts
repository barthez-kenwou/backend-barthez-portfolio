import { prismaNotDeleted } from '@/shared/infrastructure/database/prisma-soft-delete';
import prisma from '@/shared/infrastructure/database/prisma.client';

import type {
  CreateNewsletterSubscriberInput,
  NewsletterLocale,
  NewsletterStats,
  NewsletterStatus,
  NewsletterSubscriberEntity,
  NewsletterSubscriberListResult,
  UpdateNewsletterSubscriberInput,
} from '../../domain/entities/newsletter.entity';
import type { NewsletterSubscriberRepositoryPort } from '../../domain/repositories/newsletter.repository';
import { NewsletterMapper } from '../persistence/newsletter.mapper';

export class PrismaNewsletterSubscriberRepository implements NewsletterSubscriberRepositoryPort {
  async create(data: CreateNewsletterSubscriberInput): Promise<NewsletterSubscriberEntity> {
    const row = await prisma.newsletterSubscriber.create({
      data: {
        email: data.email,
        locale: data.locale,
        source: data.source,
        status: data.status,
        confirmToken: data.confirmToken,
        confirmTokenExpiresAt: data.confirmTokenExpiresAt,
        unsubscribeToken: data.unsubscribeToken,
        deletedAt: null,
      },
    });
    return NewsletterMapper.subscriberToDomain(row);
  }

  async findById(id: string): Promise<NewsletterSubscriberEntity | null> {
    const row = await prisma.newsletterSubscriber.findFirst({
      where: { id, ...prismaNotDeleted },
    });
    return row ? NewsletterMapper.subscriberToDomain(row) : null;
  }

  async findByEmail(email: string): Promise<NewsletterSubscriberEntity | null> {
    // Include soft-deleted so unique email can be revived on re-subscribe.
    const row = await prisma.newsletterSubscriber.findFirst({
      where: { email },
    });
    return row ? NewsletterMapper.subscriberToDomain(row) : null;
  }

  async findByConfirmToken(token: string): Promise<NewsletterSubscriberEntity | null> {
    const row = await prisma.newsletterSubscriber.findFirst({
      where: { confirmToken: token, ...prismaNotDeleted },
    });
    return row ? NewsletterMapper.subscriberToDomain(row) : null;
  }

  async findByUnsubscribeToken(token: string): Promise<NewsletterSubscriberEntity | null> {
    const row = await prisma.newsletterSubscriber.findFirst({
      where: { unsubscribeToken: token, ...prismaNotDeleted },
    });
    return row ? NewsletterMapper.subscriberToDomain(row) : null;
  }

  async list(input: {
    page: number;
    limit: number;
    status?: NewsletterStatus;
    locale?: NewsletterLocale;
    q?: string;
  }): Promise<NewsletterSubscriberListResult> {
    const where: Record<string, unknown> = { ...prismaNotDeleted };
    if (input.status) where.status = input.status;
    if (input.locale) where.locale = input.locale;
    if (input.q?.trim()) {
      where.email = { contains: input.q.trim().toLowerCase() };
    }

    const [rows, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      prisma.newsletterSubscriber.count({ where }),
    ]);

    return {
      items: rows.map(NewsletterMapper.subscriberToDomain),
      total,
      page: input.page,
      limit: input.limit,
      totalPages: Math.ceil(total / input.limit) || 0,
    };
  }

  async listActive(input: {
    skip: number;
    take: number;
    locale?: NewsletterLocale;
  }): Promise<NewsletterSubscriberEntity[]> {
    const where: Record<string, unknown> = {
      status: 'active',
      ...prismaNotDeleted,
    };
    if (input.locale) where.locale = input.locale;

    const rows = await prisma.newsletterSubscriber.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      skip: input.skip,
      take: input.take,
    });
    return rows.map(NewsletterMapper.subscriberToDomain);
  }

  async countActive(locale?: NewsletterLocale): Promise<number> {
    return prisma.newsletterSubscriber.count({
      where: {
        status: 'active',
        ...prismaNotDeleted,
        ...(locale ? { locale } : {}),
      },
    });
  }

  async stats(): Promise<NewsletterStats> {
    const base = { ...prismaNotDeleted };
    const [total, pending, active, unsubscribed, bounced] = await Promise.all([
      prisma.newsletterSubscriber.count({ where: base }),
      prisma.newsletterSubscriber.count({ where: { ...base, status: 'pending' } }),
      prisma.newsletterSubscriber.count({ where: { ...base, status: 'active' } }),
      prisma.newsletterSubscriber.count({ where: { ...base, status: 'unsubscribed' } }),
      prisma.newsletterSubscriber.count({ where: { ...base, status: 'bounced' } }),
    ]);
    return { total, pending, active, unsubscribed, bounced };
  }

  async update(
    id: string,
    data: UpdateNewsletterSubscriberInput,
  ): Promise<NewsletterSubscriberEntity> {
    const row = await prisma.newsletterSubscriber.update({
      where: { id },
      data: {
        ...(data.locale !== undefined ? { locale: data.locale } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.source !== undefined ? { source: data.source } : {}),
        ...(data.confirmToken !== undefined ? { confirmToken: data.confirmToken } : {}),
        ...(data.confirmTokenExpiresAt !== undefined
          ? { confirmTokenExpiresAt: data.confirmTokenExpiresAt }
          : {}),
        ...(data.unsubscribeToken !== undefined ? { unsubscribeToken: data.unsubscribeToken } : {}),
        ...(data.confirmedAt !== undefined ? { confirmedAt: data.confirmedAt } : {}),
        ...(data.unsubscribedAt !== undefined ? { unsubscribedAt: data.unsubscribedAt } : {}),
        ...(data.lastEmailedAt !== undefined ? { lastEmailedAt: data.lastEmailedAt } : {}),
        ...(data.welcomeSentAt !== undefined ? { welcomeSentAt: data.welcomeSentAt } : {}),
        ...(data.deletedAt !== undefined ? { deletedAt: data.deletedAt } : {}),
      },
    });
    return NewsletterMapper.subscriberToDomain(row);
  }
}
