import { BlogMapper } from '@/modules/blog/infrastructure/persistence/blog.mapper';
import { rbacService } from '@/modules/rbac';
import { prismaNotDeleted } from '@/shared/infrastructure/database/prisma-soft-delete';
import prisma from '@/shared/infrastructure/database/prisma.client';
import { queueMail } from '@/shared/infrastructure/mail/mail.service';
import type { MailTemplateName } from '@/shared/infrastructure/mail/mail.types';
import { heavyTasksQueue } from '@/shared/infrastructure/queue/queue.service';

import type { BlogDigestSourcePort } from '../../application/commands/send-weekly-digest.command';
import type {
  NewsletterMailerPort,
  NewsletterQueuePort,
  NewsletterRbacPort,
} from '../../application/services/newsletter.ports';

export function createNewsletterRbacAdapter(): NewsletterRbacPort {
  return {
    hasAnyRole: (userId, roles) => rbacService.hasAnyRole(userId, roles),
  };
}

export function createNewsletterMailerAdapter(): NewsletterMailerPort {
  return {
    async send(input) {
      await queueMail({
        to: input.to,
        subject: input.subject,
        template: input.template as MailTemplateName,
        data: input.data ?? {},
        priority: input.priority,
      });
    },
  };
}

export function createNewsletterQueueAdapter(): NewsletterQueuePort {
  return {
    async enqueueFanout(campaignId: string) {
      await heavyTasksQueue.add(
        'newsletter-fanout',
        { campaignId },
        {
          jobId: `newsletter-fanout-${campaignId}`,
          removeOnComplete: 50,
          removeOnFail: 100,
        },
      );
    },
  };
}

export function createBlogDigestSourceAdapter(): BlogDigestSourcePort {
  return {
    async listPublishedSince(since: Date, limit: number) {
      const rows = await prisma.blog.findMany({
        where: {
          isPublished: true,
          date: { gte: since },
          ...prismaNotDeleted,
        },
        orderBy: { date: 'desc' },
        take: limit,
      });
      return rows.map(BlogMapper.toDomain);
    },
  };
}
