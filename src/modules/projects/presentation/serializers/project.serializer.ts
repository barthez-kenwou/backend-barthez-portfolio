import type { ProjectEntity, ProjectListResult } from '../../domain/entities/project.entity';

/**
 * Strip sensitive fields from confidential projects for public responses.
 */
function sanitizeForPublic(item: ProjectEntity): ProjectEntity {
  if (!item.confidential) {
    return item;
  }

  let testimonial = item.testimonial;
  if (testimonial && typeof testimonial === 'object' && !Array.isArray(testimonial)) {
    const copy = { ...(testimonial as Record<string, unknown>) };
    delete copy.email;
    delete copy.contact;
    delete copy.emailAddress;
    testimonial = copy;
  }

  return {
    ...item,
    github: null,
    demo: null,
    resources: null,
    externalLinks: null,
    testimonial,
  };
}

/**
 * Maps domain Projects to the public API response shape.
 */
export const ProjectSerializer = {
  one(item: ProjectEntity, opts: { redactConfidential?: boolean } = {}) {
    const source = opts.redactConfidential ? sanitizeForPublic(item) : item;
    return {
      id: source.id,
      titleFr: source.titleFr,
      titleEn: source.titleEn,
      descriptionFr: source.descriptionFr,
      descriptionEn: source.descriptionEn,
      fullDescriptionFr: source.fullDescriptionFr,
      fullDescriptionEn: source.fullDescriptionEn,
      problemFr: source.problemFr,
      problemEn: source.problemEn,
      solutionFr: source.solutionFr,
      solutionEn: source.solutionEn,
      solutionsFr: source.solutionsFr,
      solutionsEn: source.solutionsEn,
      challengesFr: source.challengesFr,
      challengesEn: source.challengesEn,
      impactFr: source.impactFr,
      impactEn: source.impactEn,
      resultsFr: source.resultsFr,
      resultsEn: source.resultsEn,
      metrics: source.metrics,
      techStack: source.techStack,
      architecture: source.architecture,
      testing: source.testing,
      images: source.images,
      preview: source.preview,
      videoDemo: source.videoDemo,
      category: source.category,
      status: source.status,
      complexity: source.complexity,
      role: source.role,
      teamSize: source.teamSize,
      duration: source.duration,
      date: source.date,
      github: source.github,
      demo: source.demo,
      caseStudy: source.caseStudy,
      documentation: source.documentation,
      businessContextFr: source.businessContextFr,
      businessContextEn: source.businessContextEn,
      isFeatured: source.isFeatured,
      isPublished: source.isPublished,
      confidential: source.confidential,
      responsibilitiesFr: source.responsibilitiesFr,
      responsibilitiesEn: source.responsibilitiesEn,
      videos: source.videos,
      gallery: source.gallery,
      diagrams: source.diagrams,
      resources: source.resources,
      milestones: source.milestones,
      scopeFr: source.scopeFr,
      scopeEn: source.scopeEn,
      nonGoalsFr: source.nonGoalsFr,
      nonGoalsEn: source.nonGoalsEn,
      decisions: source.decisions,
      securityFr: source.securityFr,
      securityEn: source.securityEn,
      infraFr: source.infraFr,
      infraEn: source.infraEn,
      externalLinks: source.externalLinks,
      testimonial: source.testimonial,
      lessonsFr: source.lessonsFr,
      lessonsEn: source.lessonsEn,
      beforeAfter: source.beforeAfter,
      sortOrder: source.sortOrder,
      ownerId: source.ownerId,
      createdAt: source.createdAt,
      updatedAt: source.updatedAt,
    };
  },

  list(result: ProjectListResult, opts: { redactConfidential?: boolean } = {}) {
    return {
      items: result.items.map((item) => ProjectSerializer.one(item, opts)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  },
};
