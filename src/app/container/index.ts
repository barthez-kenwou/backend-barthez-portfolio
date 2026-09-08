/**
 * Application composition root — Dependency Injection container.
 *
 * Modules declare ports; this file wires concrete adapters once.
 * Tests can call `createContainer({ ...overrides })` with fakes.
 *
 * Design goals for the portfolio backend:
 * - Explicit, readable wiring (no hidden magic)
 * - Easy to swap Prisma → another DB adapter per module
 * - No framework lock-in (plain factories, not a DI framework)
 */
import {
  type AchievementModule,
  createAchievementModule,
  createDefaultAchievementDeps,
} from '@/modules/achievements';
import { type AuthModule, createAuthModule, createDefaultAuthDeps } from '@/modules/auth';
import { type BlogModule, createBlogModule, createDefaultBlogDeps } from '@/modules/blog';
import {
  type CertificationModule,
  createCertificationModule,
  createDefaultCertificationDeps,
} from '@/modules/certifications';
import {
  type ContactInfoModule,
  createContactInfoModule,
  createDefaultContactInfoDeps,
} from '@/modules/contact-infos';
import {
  type ContactResponseModule,
  createContactResponseModule,
  createDefaultContactResponseDeps,
} from '@/modules/contact-responses';
import { type CvModule, createCvModule, createDefaultCvDeps } from '@/modules/cv';
import {
  type EducationModule,
  createDefaultEducationDeps,
  createEducationModule,
} from '@/modules/education';
import {
  type ExperienceModule,
  createDefaultExperienceDeps,
  createExperienceModule,
} from '@/modules/experiences';
import { type FilesModule, createDefaultFilesDeps, createFilesModule } from '@/modules/files';
import {
  type LanguageModule,
  createDefaultLanguageDeps,
  createLanguageModule,
} from '@/modules/languages';
import {
  type NewsletterModule,
  createDefaultNewsletterDeps,
  createNewsletterModule,
} from '@/modules/newsletter';
import { type OAuthModule, createDefaultOAuthDeps, createOAuthModule } from '@/modules/oauth';
import {
  type ProjectModule,
  createDefaultProjectDeps,
  createProjectModule,
} from '@/modules/projects';
import { type RbacModule, createDefaultRbacDeps, createRbacModule } from '@/modules/rbac';
import {
  type ReferenceModule,
  createDefaultReferenceDeps,
  createReferenceModule,
} from '@/modules/references';
import {
  type ServiceModule,
  createDefaultServiceDeps,
  createServiceModule,
} from '@/modules/services';
import { type SkillModule, createDefaultSkillDeps, createSkillModule } from '@/modules/skills';
import { type SystemRouters, createSystemRouters } from '@/modules/system';
import {
  type TestimonialModule,
  createDefaultTestimonialDeps,
  createTestimonialModule,
} from '@/modules/testimonials';
import { type UsersModule, createDefaultUsersDeps, createUsersModule } from '@/modules/users';

export type AppContainer = {
  auth: AuthModule;
  users: UsersModule;
  rbac: RbacModule;
  blog: BlogModule;
  newsletter: NewsletterModule;
  oauth: OAuthModule;
  files: FilesModule;
  projects: ProjectModule;
  services: ServiceModule;
  skills: SkillModule;
  experiences: ExperienceModule;
  certifications: CertificationModule;
  testimonials: TestimonialModule;
  achievements: AchievementModule;
  references: ReferenceModule;
  languages: LanguageModule;
  education: EducationModule;
  contactInfos: ContactInfoModule;
  contactResponses: ContactResponseModule;
  cv: CvModule;
  system: SystemRouters;
};

export type ContainerOverrides = {
  auth?: Parameters<typeof createDefaultAuthDeps>[0];
  users?: Parameters<typeof createDefaultUsersDeps>[0];
  rbac?: Parameters<typeof createDefaultRbacDeps>[0];
  blog?: Parameters<typeof createDefaultBlogDeps>[0];
  newsletter?: Parameters<typeof createDefaultNewsletterDeps>[0];
  oauth?: Parameters<typeof createDefaultOAuthDeps>[0];
  projects?: Parameters<typeof createDefaultProjectDeps>[0];
  services?: Parameters<typeof createDefaultServiceDeps>[0];
  skills?: Parameters<typeof createDefaultSkillDeps>[0];
  experiences?: Parameters<typeof createDefaultExperienceDeps>[0];
  certifications?: Parameters<typeof createDefaultCertificationDeps>[0];
  testimonials?: Parameters<typeof createDefaultTestimonialDeps>[0];
  achievements?: Parameters<typeof createDefaultAchievementDeps>[0];
  references?: Parameters<typeof createDefaultReferenceDeps>[0];
  languages?: Parameters<typeof createDefaultLanguageDeps>[0];
  education?: Parameters<typeof createDefaultEducationDeps>[0];
  contactInfos?: Parameters<typeof createDefaultContactInfoDeps>[0];
  contactResponses?: Parameters<typeof createDefaultContactResponseDeps>[0];
  cv?: Parameters<typeof createDefaultCvDeps>[0];
  files?: Parameters<typeof createDefaultFilesDeps>[0];
};

/**
 * Build the full application graph.
 * Call once at boot; pass overrides in tests.
 */
export function createContainer(overrides: ContainerOverrides = {}): AppContainer {
  // RBAC first — auth and users depend on permission lookups.
  const rbac = createRbacModule(createDefaultRbacDeps(overrides.rbac));

  const auth = createAuthModule(createDefaultAuthDeps(overrides.auth));
  const users = createUsersModule(createDefaultUsersDeps(overrides.users));
  const newsletter = createNewsletterModule(createDefaultNewsletterDeps(overrides.newsletter));
  const blog = createBlogModule(
    createDefaultBlogDeps({
      ...overrides.blog,
      newsletter: overrides.blog?.newsletter ?? {
        onBlogPublished: (b) => newsletter.onBlogPublished(b),
      },
    }),
  );
  const oauth = createOAuthModule(createDefaultOAuthDeps(overrides.oauth));
  const files = createFilesModule(createDefaultFilesDeps(overrides.files));
  const contactResponses = createContactResponseModule(
    createDefaultContactResponseDeps(overrides.contactResponses),
  );
  const contactInfos = createContactInfoModule(
    createDefaultContactInfoDeps(overrides.contactInfos),
  );
  const education = createEducationModule(createDefaultEducationDeps(overrides.education));
  const languages = createLanguageModule(createDefaultLanguageDeps(overrides.languages));
  const references = createReferenceModule(createDefaultReferenceDeps(overrides.references));
  const achievements = createAchievementModule(
    createDefaultAchievementDeps(overrides.achievements),
  );
  const testimonials = createTestimonialModule(
    createDefaultTestimonialDeps(overrides.testimonials),
  );
  const certifications = createCertificationModule(
    createDefaultCertificationDeps(overrides.certifications),
  );
  const experiences = createExperienceModule(createDefaultExperienceDeps(overrides.experiences));
  const skills = createSkillModule(createDefaultSkillDeps(overrides.skills));
  const services = createServiceModule(createDefaultServiceDeps(overrides.services));
  const projects = createProjectModule(createDefaultProjectDeps(overrides.projects));
  const cv = createCvModule(createDefaultCvDeps(overrides.cv));
  const system = createSystemRouters();

  return {
    auth,
    users,
    rbac,
    blog,
    newsletter,
    oauth,
    files,
    projects,
    services,
    skills,
    experiences,
    certifications,
    testimonials,
    achievements,
    references,
    languages,
    education,
    contactInfos,
    contactResponses,
    cv,
    system,
  };
}

/** Singleton used by the HTTP process. Prefer `createContainer` in tests. */
let singleton: AppContainer | null = null;

export function getContainer(): AppContainer {
  if (!singleton) {
    singleton = createContainer();
  }
  return singleton;
}

export function resetContainer(): void {
  singleton = null;
}
