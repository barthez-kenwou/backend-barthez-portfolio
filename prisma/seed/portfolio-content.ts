/**
 * Portfolio content seed — data sourced from barthez-kenwou-porfolio frontend mocks.
 *
 * JSON under prisma/seed/data/ mirrors frontend entity mocks + CV languages/references
 * + admin CMS demo contact responses.
 */
import type {
  ContactResponseStatus,
  Prisma,
  TestimonialModerationStatus,
  TestimonialSource,
} from '@prisma/client';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import prisma from '@/shared/infrastructure/database/prisma.client';
import log from '@/shared/infrastructure/logging/logger';

const DATA_DIR = join(__dirname, 'data');

type SmallerDomains = {
  achievements: Array<{
    sortOrder: number;
    iconKey: string;
    value: string;
    labelFr: string;
    labelEn: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    year: string;
    link?: string;
  }>;
  education: Array<{
    degreeFr: string;
    degreeEn: string;
    school: string;
    period: string;
    link?: string;
  }>;
  experiences: Array<{
    titleFr: string;
    titleEn: string;
    companyFr: string;
    companyEn: string;
    period: string;
    descriptionFr: string[];
    descriptionEn: string[];
  }>;
  services: Array<{
    sortOrder: number;
    iconKey: string;
    titleFr: string;
    titleEn: string;
    descFr: string;
    descEn: string;
    featuresFr: string[];
    featuresEn: string[];
    priceEur: number;
    hourly: boolean;
    priceFr: string;
    priceEn: string;
  }>;
  skills: Array<{
    name: string;
    category: string;
    level: number;
    icon: string;
  }>;
  testimonials: Array<{
    rating: number;
    textFr: string;
    textEn: string;
    nameFr: string;
    nameEn: string;
    roleFr: string;
    roleEn: string;
    company?: string;
    email?: string;
    isPublished?: boolean;
    status?: TestimonialModerationStatus;
    source?: TestimonialSource;
  }>;
  contactInfo: {
    name: string;
    handle: string;
    titleFr: string;
    titleEn: string;
    subtitleFr: string;
    subtitleEn: string;
    email: string;
    phone: string;
    whatsappLink: string;
    location: string;
    website: string;
    repository: string;
    github: string;
    linkedin: string;
    facebook: string;
    photoUrl?: string;
    yearsExperience?: number;
    tags?: string[];
  };
  languages: Array<{
    language: string;
    proficiencyFr: string;
    proficiencyEn: string;
  }>;
  references: Array<{
    name: string;
    roleFr: string;
    roleEn: string;
    company: string;
    email: string;
    phone: string;
  }>;
  contactResponses: Array<{
    name: string;
    email: string;
    subject: string;
    message: string;
    status: ContactResponseStatus;
    notes?: string;
    createdAt: string;
  }>;
};

type BlogSeed = {
  slug: string;
  titleFr: string;
  titleEn: string;
  excerptFr: string;
  excerptEn: string;
  contentFr: string;
  contentEn: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  tags: string[];
  isPublished?: boolean;
};

type ProjectSeed = Record<string, unknown>;

const loadJson = <T>(filename: string): T => {
  const raw = readFileSync(join(DATA_DIR, filename), 'utf8');
  return JSON.parse(raw) as T;
};

const emptyToNull = (value: unknown): string | null => {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  return s.length ? s : null;
};

const asStringArray = (value: unknown): string[] => (Array.isArray(value) ? value.map(String) : []);

const asJson = (value: unknown): Prisma.InputJsonValue | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string' && value.trim() === '') return undefined;
  return value as Prisma.InputJsonValue;
};

/** Resolve `RELATIVE:-45m` / `-26h` markers from admin CMS demo seed. */
const resolveRelativeDate = (raw: string): Date => {
  const match = /^RELATIVE:-(\d+)([mhd])$/i.exec(raw.trim());
  if (!match) {
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const ms =
    unit === 'm' ? amount * 60_000 : unit === 'h' ? amount * 3_600_000 : amount * 86_400_000;
  return new Date(Date.now() - ms);
};

const mapProject = (project: ProjectSeed, sortOrder: number): Prisma.ProjectCreateInput => {
  const techStack = project.techStack ?? {};
  return {
    titleFr: String(project.titleFr ?? ''),
    titleEn: String(project.titleEn ?? ''),
    descriptionFr: String(project.descriptionFr ?? ''),
    descriptionEn: String(project.descriptionEn ?? ''),
    fullDescriptionFr: emptyToNull(project.fullDescriptionFr),
    fullDescriptionEn: emptyToNull(project.fullDescriptionEn),
    problemFr: String(project.problemFr ?? ''),
    problemEn: String(project.problemEn ?? ''),
    solutionFr: asStringArray(project.solutionFr),
    solutionEn: asStringArray(project.solutionEn),
    solutionsFr: asStringArray(project.solutionsFr),
    solutionsEn: asStringArray(project.solutionsEn),
    challengesFr: asStringArray(project.challengesFr),
    challengesEn: asStringArray(project.challengesEn),
    impactFr: asStringArray(project.impactFr),
    impactEn: asStringArray(project.impactEn),
    resultsFr: asStringArray(project.resultsFr),
    resultsEn: asStringArray(project.resultsEn),
    metrics: asJson(project.metrics),
    techStack: asJson(techStack) as Prisma.InputJsonValue,
    architecture: asStringArray(project.architecture),
    testing: asStringArray(project.testing),
    images: asStringArray(project.images),
    preview: String(project.preview ?? ''),
    videoDemo: emptyToNull(project.videoDemo),
    category: String(project.category ?? 'Other'),
    status: String(project.status ?? 'Production'),
    complexity: String(project.complexity ?? 'Intermédiaire'),
    role: String(project.role ?? 'Full Stack Developer'),
    teamSize: typeof project.teamSize === 'number' ? project.teamSize : null,
    duration: String(project.duration ?? ''),
    date: String(project.date ?? ''),
    github: emptyToNull(project.github),
    demo: emptyToNull(project.demo),
    caseStudy: emptyToNull(project.caseStudy),
    documentation: emptyToNull(project.documentation),
    businessContextFr: emptyToNull(project.businessContextFr),
    businessContextEn: emptyToNull(project.businessContextEn),
    isFeatured: Boolean(project.isFeatured),
    isPublished: project.isPublished !== false,
    confidential: Boolean(project.confidential),
    responsibilitiesFr: asStringArray(project.responsibilitiesFr),
    responsibilitiesEn: asStringArray(project.responsibilitiesEn),
    videos: asJson(project.videos),
    gallery: asJson(project.gallery),
    diagrams: asJson(project.diagrams),
    resources: asJson(project.resources),
    milestones: asJson(project.milestones),
    scopeFr: asStringArray(project.scopeFr),
    scopeEn: asStringArray(project.scopeEn),
    nonGoalsFr: asStringArray(project.nonGoalsFr),
    nonGoalsEn: asStringArray(project.nonGoalsEn),
    decisions: asJson(project.decisions),
    securityFr: asStringArray(project.securityFr),
    securityEn: asStringArray(project.securityEn),
    infraFr: asStringArray(project.infraFr),
    infraEn: asStringArray(project.infraEn),
    externalLinks: asJson(project.externalLinks),
    testimonial: asJson(project.testimonial),
    lessonsFr: asStringArray(project.lessonsFr),
    lessonsEn: asStringArray(project.lessonsEn),
    beforeAfter: asJson(project.beforeAfter),
    sortOrder,
    deletedAt: null,
  };
};

/**
 * Wipe + re-insert portfolio CMS collections (idempotent content refresh).
 * Does not touch users, RBAC, auth tokens, or audit logs.
 */
export async function seedPortfolioContent(): Promise<void> {
  const smaller = loadJson<SmallerDomains>('smaller-domains.json');
  const blogs = loadJson<BlogSeed[]>('blogs.json');
  const projects = loadJson<ProjectSeed[]>('projects.json');

  log.info('Seeding portfolio content from frontend mocks', {
    achievements: smaller.achievements.length,
    certifications: smaller.certifications.length,
    education: smaller.education.length,
    experiences: smaller.experiences.length,
    services: smaller.services.length,
    skills: smaller.skills.length,
    testimonials: smaller.testimonials.length,
    languages: smaller.languages.length,
    references: smaller.references.length,
    contactResponses: smaller.contactResponses.length,
    blogs: blogs.length,
    projects: projects.length,
  });

  await Promise.all([
    prisma.achievement.deleteMany({}),
    prisma.certification.deleteMany({}),
    prisma.education.deleteMany({}),
    prisma.experience.deleteMany({}),
    prisma.service.deleteMany({}),
    prisma.skill.deleteMany({}),
    prisma.testimonial.deleteMany({}),
    prisma.language.deleteMany({}),
    prisma.reference.deleteMany({}),
    prisma.contactResponse.deleteMany({}),
    prisma.blog.deleteMany({}),
    prisma.project.deleteMany({}),
  ]);

  await prisma.contactInfo.upsert({
    where: { singletonKey: 'default' },
    create: {
      singletonKey: 'default',
      ...smaller.contactInfo,
      photoUrl: smaller.contactInfo.photoUrl ?? null,
      yearsExperience: smaller.contactInfo.yearsExperience ?? 3,
      tags: smaller.contactInfo.tags ?? ['TypeScript', 'AWS', 'DevOps', 'Full Stack'],
      deletedAt: null,
    },
    update: {
      ...smaller.contactInfo,
      photoUrl: smaller.contactInfo.photoUrl ?? null,
      yearsExperience: smaller.contactInfo.yearsExperience ?? 3,
      tags: smaller.contactInfo.tags ?? ['TypeScript', 'AWS', 'DevOps', 'Full Stack'],
      deletedAt: null,
    },
  });

  for (const [index, item] of smaller.achievements.entries()) {
    await prisma.achievement.create({
      data: {
        iconKey: item.iconKey,
        value: item.value,
        labelFr: item.labelFr,
        labelEn: item.labelEn,
        sortOrder: item.sortOrder ?? index,
        deletedAt: null,
      },
    });
  }

  for (const [index, item] of smaller.certifications.entries()) {
    await prisma.certification.create({
      data: {
        name: item.name,
        issuer: item.issuer,
        year: item.year,
        link: emptyToNull(item.link),
        sortOrder: index,
        deletedAt: null,
      },
    });
  }

  for (const [index, item] of smaller.education.entries()) {
    await prisma.education.create({
      data: {
        degreeFr: item.degreeFr.trim(),
        degreeEn: item.degreeEn.trim(),
        school: item.school,
        period: item.period,
        link: emptyToNull(item.link),
        sortOrder: index,
        deletedAt: null,
      },
    });
  }

  for (const [index, item] of smaller.experiences.entries()) {
    await prisma.experience.create({
      data: {
        titleFr: item.titleFr,
        titleEn: item.titleEn,
        companyFr: item.companyFr,
        companyEn: item.companyEn,
        period: item.period,
        descriptionFr: item.descriptionFr,
        descriptionEn: item.descriptionEn,
        sortOrder: index,
        deletedAt: null,
      },
    });
  }

  for (const item of smaller.services) {
    await prisma.service.create({
      data: {
        iconKey: item.iconKey,
        titleFr: item.titleFr,
        titleEn: item.titleEn,
        descFr: item.descFr,
        descEn: item.descEn,
        featuresFr: item.featuresFr,
        featuresEn: item.featuresEn,
        priceEur: item.priceEur,
        hourly: item.hourly,
        priceFr: item.priceFr,
        priceEn: item.priceEn,
        sortOrder: item.sortOrder,
        isPublished: true,
        deletedAt: null,
      },
    });
  }

  for (const [index, item] of smaller.skills.entries()) {
    await prisma.skill.create({
      data: {
        name: item.name,
        category: item.category,
        level: item.level,
        icon: item.icon,
        sortOrder: index,
        deletedAt: null,
      },
    });
  }

  for (const [index, item] of smaller.testimonials.entries()) {
    await prisma.testimonial.create({
      data: {
        rating: item.rating,
        textFr: item.textFr,
        textEn: item.textEn,
        nameFr: item.nameFr,
        nameEn: item.nameEn,
        roleFr: item.roleFr,
        roleEn: item.roleEn,
        company: emptyToNull(item.company),
        email: emptyToNull(item.email),
        isPublished: item.isPublished ?? true,
        status: item.status ?? 'approved',
        source: item.source ?? 'admin',
        sortOrder: index,
        deletedAt: null,
      },
    });
  }

  for (const [index, item] of smaller.languages.entries()) {
    await prisma.language.create({
      data: {
        language: item.language,
        proficiencyFr: item.proficiencyFr,
        proficiencyEn: item.proficiencyEn,
        sortOrder: index,
        deletedAt: null,
      },
    });
  }

  for (const [index, item] of smaller.references.entries()) {
    await prisma.reference.create({
      data: {
        name: item.name,
        roleFr: item.roleFr,
        roleEn: item.roleEn,
        company: item.company,
        email: item.email,
        phone: item.phone,
        sortOrder: index,
        deletedAt: null,
      },
    });
  }

  for (const item of smaller.contactResponses) {
    const createdAt = resolveRelativeDate(item.createdAt);
    await prisma.contactResponse.create({
      data: {
        name: item.name,
        email: item.email,
        subject: item.subject,
        message: item.message,
        status: item.status,
        notes: emptyToNull(item.notes),
        createdAt,
        updatedAt: createdAt,
        deletedAt: null,
      },
    });
  }

  for (const blog of blogs) {
    await prisma.blog.create({
      data: {
        slug: blog.slug,
        titleFr: blog.titleFr,
        titleEn: blog.titleEn,
        excerptFr: blog.excerptFr,
        excerptEn: blog.excerptEn,
        contentFr: blog.contentFr,
        contentEn: blog.contentEn,
        image: blog.image,
        category: blog.category,
        date: new Date(blog.date),
        readTime: blog.readTime,
        author: blog.author,
        tags: blog.tags ?? [],
        isPublished: blog.isPublished !== false,
        views: 0,
        deletedAt: null,
      },
    });
  }

  for (const [index, project] of projects.entries()) {
    await prisma.project.create({
      data: mapProject(project, index),
    });
  }

  log.info('Portfolio content seed completed', {
    skills: await prisma.skill.count(),
    projects: await prisma.project.count(),
    blogs: await prisma.blog.count(),
    services: await prisma.service.count(),
    experiences: await prisma.experience.count(),
    testimonials: await prisma.testimonial.count(),
  });
}
