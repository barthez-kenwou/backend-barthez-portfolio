import type { Prisma } from '@prisma/client';

import { prismaNotDeleted } from '@/shared/infrastructure/database/prisma-soft-delete';
import prisma from '@/shared/infrastructure/database/prisma.client';

import type {
  CreateProjectInput,
  ProjectEntity,
  ProjectListFilters,
  ProjectListResult,
  UpdateProjectInput,
} from '../../domain/entities/project.entity';
import type { ProjectRepositoryPort } from '../../domain/repositories/project.repository';
import { ProjectMapper } from '../persistence/project.mapper';

/** Mongo optional Json: omit null/undefined — Prisma.JsonNull is not valid here. */
const asJson = (value: unknown): Prisma.InputJsonValue | undefined => {
  if (value === undefined || value === null) return undefined;
  return value as Prisma.InputJsonValue;
};

/**
 * Mongo-backed Project persistence via Prisma.
 */
export class PrismaProjectRepository implements ProjectRepositoryPort {
  async create(data: CreateProjectInput): Promise<ProjectEntity> {
    const row = await prisma.project.create({
      data: {
        titleFr: data.titleFr,
        titleEn: data.titleEn,
        descriptionFr: data.descriptionFr,
        descriptionEn: data.descriptionEn,
        fullDescriptionFr: data.fullDescriptionFr ?? null,
        fullDescriptionEn: data.fullDescriptionEn ?? null,
        problemFr: data.problemFr,
        problemEn: data.problemEn,
        solutionFr: data.solutionFr,
        solutionEn: data.solutionEn,
        solutionsFr: data.solutionsFr ?? [],
        solutionsEn: data.solutionsEn ?? [],
        challengesFr: data.challengesFr ?? [],
        challengesEn: data.challengesEn ?? [],
        impactFr: data.impactFr,
        impactEn: data.impactEn,
        resultsFr: data.resultsFr ?? [],
        resultsEn: data.resultsEn ?? [],
        metrics: asJson(data.metrics ?? null),
        techStack: asJson(data.techStack) as Prisma.InputJsonValue,
        architecture: data.architecture ?? [],
        testing: data.testing ?? [],
        images: data.images,
        preview: data.preview,
        videoDemo: data.videoDemo ?? null,
        category: data.category,
        status: data.status,
        complexity: data.complexity,
        role: data.role,
        teamSize: data.teamSize ?? null,
        duration: data.duration,
        date: data.date,
        github: data.github ?? null,
        demo: data.demo ?? null,
        caseStudy: data.caseStudy ?? null,
        documentation: data.documentation ?? null,
        businessContextFr: data.businessContextFr ?? null,
        businessContextEn: data.businessContextEn ?? null,
        isFeatured: data.isFeatured ?? false,
        isPublished: data.isPublished ?? false,
        confidential: data.confidential ?? false,
        responsibilitiesFr: data.responsibilitiesFr ?? [],
        responsibilitiesEn: data.responsibilitiesEn ?? [],
        videos: asJson(data.videos ?? null),
        gallery: asJson(data.gallery ?? null),
        diagrams: asJson(data.diagrams ?? null),
        resources: asJson(data.resources ?? null),
        milestones: asJson(data.milestones ?? null),
        scopeFr: data.scopeFr ?? [],
        scopeEn: data.scopeEn ?? [],
        nonGoalsFr: data.nonGoalsFr ?? [],
        nonGoalsEn: data.nonGoalsEn ?? [],
        decisions: asJson(data.decisions ?? null),
        securityFr: data.securityFr ?? [],
        securityEn: data.securityEn ?? [],
        infraFr: data.infraFr ?? [],
        infraEn: data.infraEn ?? [],
        externalLinks: asJson(data.externalLinks ?? null),
        testimonial: asJson(data.testimonial ?? null),
        lessonsFr: data.lessonsFr ?? [],
        lessonsEn: data.lessonsEn ?? [],
        beforeAfter: asJson(data.beforeAfter ?? null),
        sortOrder: data.sortOrder ?? 0,
        ownerId: data.ownerId,
        deletedAt: null,
      },
    });
    return ProjectMapper.toDomain(row);
  }

  async findById(id: string): Promise<ProjectEntity | null> {
    const row = await prisma.project.findFirst({
      where: { id, ...prismaNotDeleted },
    });
    return row ? ProjectMapper.toDomain(row) : null;
  }

  async list(filters: ProjectListFilters): Promise<ProjectListResult> {
    const where: Prisma.ProjectWhereInput = {
      ...prismaNotDeleted,
      ...(filters.isPublished !== undefined ? { isPublished: filters.isPublished } : {}),
      ...(filters.isFeatured !== undefined ? { isFeatured: filters.isFeatured } : {}),
      ...(filters.category ? { category: filters.category } : {}),
    };

    const [rows, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.project.count({ where }),
    ]);

    return {
      items: rows.map(ProjectMapper.toDomain),
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit) || 0,
    };
  }

  async update(id: string, data: UpdateProjectInput): Promise<ProjectEntity> {
    const row = await prisma.project.update({
      where: { id },
      data: {
        ...(data.titleFr !== undefined ? { titleFr: data.titleFr } : {}),
        ...(data.titleEn !== undefined ? { titleEn: data.titleEn } : {}),
        ...(data.descriptionFr !== undefined ? { descriptionFr: data.descriptionFr } : {}),
        ...(data.descriptionEn !== undefined ? { descriptionEn: data.descriptionEn } : {}),
        ...(data.fullDescriptionFr !== undefined
          ? { fullDescriptionFr: data.fullDescriptionFr }
          : {}),
        ...(data.fullDescriptionEn !== undefined
          ? { fullDescriptionEn: data.fullDescriptionEn }
          : {}),
        ...(data.problemFr !== undefined ? { problemFr: data.problemFr } : {}),
        ...(data.problemEn !== undefined ? { problemEn: data.problemEn } : {}),
        ...(data.solutionFr !== undefined ? { solutionFr: data.solutionFr } : {}),
        ...(data.solutionEn !== undefined ? { solutionEn: data.solutionEn } : {}),
        ...(data.solutionsFr !== undefined ? { solutionsFr: data.solutionsFr } : {}),
        ...(data.solutionsEn !== undefined ? { solutionsEn: data.solutionsEn } : {}),
        ...(data.challengesFr !== undefined ? { challengesFr: data.challengesFr } : {}),
        ...(data.challengesEn !== undefined ? { challengesEn: data.challengesEn } : {}),
        ...(data.impactFr !== undefined ? { impactFr: data.impactFr } : {}),
        ...(data.impactEn !== undefined ? { impactEn: data.impactEn } : {}),
        ...(data.resultsFr !== undefined ? { resultsFr: data.resultsFr } : {}),
        ...(data.resultsEn !== undefined ? { resultsEn: data.resultsEn } : {}),
        ...(data.metrics !== undefined ? { metrics: asJson(data.metrics) } : {}),
        ...(data.techStack !== undefined ? { techStack: asJson(data.techStack) } : {}),
        ...(data.architecture !== undefined ? { architecture: data.architecture } : {}),
        ...(data.testing !== undefined ? { testing: data.testing } : {}),
        ...(data.images !== undefined ? { images: data.images } : {}),
        ...(data.preview !== undefined ? { preview: data.preview } : {}),
        ...(data.videoDemo !== undefined ? { videoDemo: data.videoDemo } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.complexity !== undefined ? { complexity: data.complexity } : {}),
        ...(data.role !== undefined ? { role: data.role } : {}),
        ...(data.teamSize !== undefined ? { teamSize: data.teamSize } : {}),
        ...(data.duration !== undefined ? { duration: data.duration } : {}),
        ...(data.date !== undefined ? { date: data.date } : {}),
        ...(data.github !== undefined ? { github: data.github } : {}),
        ...(data.demo !== undefined ? { demo: data.demo } : {}),
        ...(data.caseStudy !== undefined ? { caseStudy: data.caseStudy } : {}),
        ...(data.documentation !== undefined ? { documentation: data.documentation } : {}),
        ...(data.businessContextFr !== undefined
          ? { businessContextFr: data.businessContextFr }
          : {}),
        ...(data.businessContextEn !== undefined
          ? { businessContextEn: data.businessContextEn }
          : {}),
        ...(data.isFeatured !== undefined ? { isFeatured: data.isFeatured } : {}),
        ...(data.isPublished !== undefined ? { isPublished: data.isPublished } : {}),
        ...(data.confidential !== undefined ? { confidential: data.confidential } : {}),
        ...(data.responsibilitiesFr !== undefined
          ? { responsibilitiesFr: data.responsibilitiesFr }
          : {}),
        ...(data.responsibilitiesEn !== undefined
          ? { responsibilitiesEn: data.responsibilitiesEn }
          : {}),
        ...(data.videos !== undefined ? { videos: asJson(data.videos) } : {}),
        ...(data.gallery !== undefined ? { gallery: asJson(data.gallery) } : {}),
        ...(data.diagrams !== undefined ? { diagrams: asJson(data.diagrams) } : {}),
        ...(data.resources !== undefined ? { resources: asJson(data.resources) } : {}),
        ...(data.milestones !== undefined ? { milestones: asJson(data.milestones) } : {}),
        ...(data.scopeFr !== undefined ? { scopeFr: data.scopeFr } : {}),
        ...(data.scopeEn !== undefined ? { scopeEn: data.scopeEn } : {}),
        ...(data.nonGoalsFr !== undefined ? { nonGoalsFr: data.nonGoalsFr } : {}),
        ...(data.nonGoalsEn !== undefined ? { nonGoalsEn: data.nonGoalsEn } : {}),
        ...(data.decisions !== undefined ? { decisions: asJson(data.decisions) } : {}),
        ...(data.securityFr !== undefined ? { securityFr: data.securityFr } : {}),
        ...(data.securityEn !== undefined ? { securityEn: data.securityEn } : {}),
        ...(data.infraFr !== undefined ? { infraFr: data.infraFr } : {}),
        ...(data.infraEn !== undefined ? { infraEn: data.infraEn } : {}),
        ...(data.externalLinks !== undefined ? { externalLinks: asJson(data.externalLinks) } : {}),
        ...(data.testimonial !== undefined ? { testimonial: asJson(data.testimonial) } : {}),
        ...(data.lessonsFr !== undefined ? { lessonsFr: data.lessonsFr } : {}),
        ...(data.lessonsEn !== undefined ? { lessonsEn: data.lessonsEn } : {}),
        ...(data.beforeAfter !== undefined ? { beforeAfter: asJson(data.beforeAfter) } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
        ...(data.deletedAt !== undefined ? { deletedAt: data.deletedAt } : {}),
      },
    });
    return ProjectMapper.toDomain(row);
  }
}
