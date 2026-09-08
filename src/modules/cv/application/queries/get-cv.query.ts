import { prismaNotDeleted } from '@/shared/infrastructure/database/prisma-soft-delete';
import prisma from '@/shared/infrastructure/database/prisma.client';

export type CvAggregate = {
  contactInfo: Awaited<ReturnType<typeof prisma.contactInfo.findFirst>>;
  experiences: Awaited<ReturnType<typeof prisma.experience.findMany>>;
  education: Awaited<ReturnType<typeof prisma.education.findMany>>;
  skills: Awaited<ReturnType<typeof prisma.skill.findMany>>;
  featuredProjects: Awaited<ReturnType<typeof prisma.project.findMany>>;
  certifications: Awaited<ReturnType<typeof prisma.certification.findMany>>;
  languages: Awaited<ReturnType<typeof prisma.language.findMany>>;
  references: Awaited<ReturnType<typeof prisma.reference.findMany>>;
};

/**
 * Loads the public CV aggregate directly via Prisma.
 * Other domain modules may still be stubs with mismatched fields — CV bypasses them.
 */
export class GetCvQuery {
  async execute(): Promise<CvAggregate> {
    const [
      contactInfo,
      experiences,
      education,
      skills,
      featuredProjects,
      certifications,
      languages,
      references,
    ] = await Promise.all([
      prisma.contactInfo.findFirst({
        where: { singletonKey: 'default', ...prismaNotDeleted },
      }),
      prisma.experience.findMany({
        where: { ...prismaNotDeleted },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.education.findMany({
        where: { ...prismaNotDeleted },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.skill.findMany({
        where: { ...prismaNotDeleted },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.project.findMany({
        where: {
          isPublished: true,
          isFeatured: true,
          ...prismaNotDeleted,
        },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.certification.findMany({
        where: { ...prismaNotDeleted },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.language.findMany({
        where: { ...prismaNotDeleted },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.reference.findMany({
        where: { ...prismaNotDeleted },
        orderBy: { sortOrder: 'asc' },
      }),
    ]);

    return {
      contactInfo,
      experiences,
      education,
      skills,
      featuredProjects,
      certifications,
      languages,
      references,
    };
  }
}
