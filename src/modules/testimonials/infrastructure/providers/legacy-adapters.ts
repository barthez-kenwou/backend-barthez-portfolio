import type { Prisma } from '@prisma/client';

import { prismaNotDeleted } from '@/shared/infrastructure/database/prisma-soft-delete';
import prisma from '@/shared/infrastructure/database/prisma.client';

import type { ProjectTestimonialLinkPort } from '../../application/services/project-testimonial-link.port';
import type { TestimonialRbacPort } from '../../application/services/rbac.port';

/**
 * Default adapters bridging shared RBAC into Testimonial ports.
 */
export const createTestimonialRbacAdapter = (): TestimonialRbacPort => ({
  async hasAnyRole(userId: string, roles: string[]): Promise<boolean> {
    const { rbacService } = await import('@/modules/rbac');
    return rbacService.hasAnyRole(userId, roles);
  },
});

/**
 * Prisma-backed project link for mirroring approved testimonials onto Project.testimonial.
 */
export const createProjectTestimonialLinkAdapter = (): ProjectTestimonialLinkPort => ({
  async isLinkable(projectId, opts) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ...prismaNotDeleted,
        ...(opts.requirePublished ? { isPublished: true } : {}),
      },
      select: { id: true },
    });
    return Boolean(project);
  },

  async setEmbedded(projectId, value) {
    await prisma.project.update({
      where: { id: projectId },
      data: { testimonial: value as unknown as Prisma.InputJsonValue },
    });
  },

  async clearEmbeddedIfOwnedBy(projectId, testimonialId) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, ...prismaNotDeleted },
      select: { testimonial: true },
    });
    if (!project?.testimonial || typeof project.testimonial !== 'object') {
      return;
    }
    const embedded = project.testimonial as { testimonialId?: unknown };
    if (embedded.testimonialId !== testimonialId) {
      return;
    }
    // Mongo Json: null clears the case-study tab (Prisma.JsonNull is not valid here).
    await prisma.project.update({
      where: { id: projectId },
      data: { testimonial: null as unknown as Prisma.InputJsonValue },
    });
  },
});
