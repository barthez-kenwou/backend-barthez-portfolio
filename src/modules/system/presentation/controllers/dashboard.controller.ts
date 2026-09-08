import type { Request, Response } from 'express';

import { prismaNotDeleted } from '@/shared/infrastructure/database/prisma-soft-delete';
import prisma from '@/shared/infrastructure/database/prisma.client';
import { asyncHandler, response } from '@/shared/utils/http/responses/helpers';

/**
 * Admin dashboard counts — Prisma aggregates only.
 */
export function createDashboardController() {
  const get = asyncHandler(async (req: Request, res: Response) => {
    const [publishedProjects, publishedBlogs, newContactResponses, pendingTestimonials] =
      await Promise.all([
        prisma.project.count({
          where: { isPublished: true, ...prismaNotDeleted },
        }),
        prisma.blog.count({
          where: { isPublished: true, ...prismaNotDeleted },
        }),
        prisma.contactResponse.count({
          where: { status: 'new', ...prismaNotDeleted },
        }),
        prisma.testimonial.count({
          where: { status: 'pending', ...prismaNotDeleted },
        }),
      ]);

    return response.ok(
      req,
      res,
      {
        publishedProjects,
        publishedBlogs,
        newContactResponses,
        pendingTestimonials,
      },
      'Dashboard stats retrieved successfully',
    );
  });

  return { get };
}

export type DashboardController = ReturnType<typeof createDashboardController>;
