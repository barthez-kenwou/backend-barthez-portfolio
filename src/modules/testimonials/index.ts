import type { Router } from 'express';

import { type AuditPort, auditRepository } from '@/shared/infrastructure/audit';

import { ApproveTestimonialCommand } from './application/commands/approve-testimonial.command';
import { CreateTestimonialCommand } from './application/commands/create-testimonial.command';
import { DeleteTestimonialCommand } from './application/commands/delete-testimonial.command';
import { RejectTestimonialCommand } from './application/commands/reject-testimonial.command';
import { SubmitPublicTestimonialCommand } from './application/commands/submit-public-testimonial.command';
import { UpdateTestimonialCommand } from './application/commands/update-testimonial.command';
import { GetTestimonialQuery } from './application/queries/get-testimonial.query';
import { ListTestimonialsQuery } from './application/queries/list-testimonials.query';
import type { ProjectTestimonialLinkPort } from './application/services/project-testimonial-link.port';
import type { TestimonialRbacPort } from './application/services/rbac.port';
import type { TestimonialRepositoryPort } from './domain/repositories/testimonial.repository';
import {
  createProjectTestimonialLinkAdapter,
  createTestimonialRbacAdapter,
} from './infrastructure/providers/legacy-adapters';
import { PrismaTestimonialRepository } from './infrastructure/repositories/prisma-testimonial.repository';
import {
  type TestimonialController,
  createTestimonialController,
} from './presentation/controllers/testimonial.controller';
import { createTestimonialRoutes } from './presentation/routes/testimonial.routes';

export type TestimonialModuleDeps = {
  testimonialRepository: TestimonialRepositoryPort;
  rbac: TestimonialRbacPort;
  projectLink?: ProjectTestimonialLinkPort;
  audit?: AuditPort;
};

export type TestimonialModule = {
  deps: TestimonialModuleDeps;
  useCases: {
    createTestimonial: CreateTestimonialCommand;
    submitPublicTestimonial: SubmitPublicTestimonialCommand;
    updateTestimonial: UpdateTestimonialCommand;
    deleteTestimonial: DeleteTestimonialCommand;
    approveTestimonial: ApproveTestimonialCommand;
    rejectTestimonial: RejectTestimonialCommand;
    getTestimonial: GetTestimonialQuery;
    listTestimonials: ListTestimonialsQuery;
  };
  controller: TestimonialController;
  router: Router;
};

export function createDefaultTestimonialDeps(
  overrides: Partial<TestimonialModuleDeps> = {},
): TestimonialModuleDeps {
  return {
    testimonialRepository: overrides.testimonialRepository ?? new PrismaTestimonialRepository(),
    rbac: overrides.rbac ?? createTestimonialRbacAdapter(),
    projectLink: overrides.projectLink ?? createProjectTestimonialLinkAdapter(),
    audit: overrides.audit ?? auditRepository,
  };
}

export function createTestimonialModule(deps: TestimonialModuleDeps): TestimonialModule {
  const useCases = {
    createTestimonial: new CreateTestimonialCommand(deps),
    submitPublicTestimonial: new SubmitPublicTestimonialCommand(deps),
    updateTestimonial: new UpdateTestimonialCommand(deps),
    deleteTestimonial: new DeleteTestimonialCommand(deps),
    approveTestimonial: new ApproveTestimonialCommand(deps),
    rejectTestimonial: new RejectTestimonialCommand(deps),
    getTestimonial: new GetTestimonialQuery(deps),
    listTestimonials: new ListTestimonialsQuery(deps),
  };

  const controller = createTestimonialController({
    ...useCases,
    rbac: deps.rbac,
  });

  const router = createTestimonialRoutes(controller);

  return { deps, useCases, controller, router };
}

export function createTestimonialRouter(overrides: Partial<TestimonialModuleDeps> = {}): Router {
  return createTestimonialModule(createDefaultTestimonialDeps(overrides)).router;
}

export type { TestimonialEntity } from './domain/entities/testimonial.entity';
export { PrismaTestimonialRepository } from './infrastructure/repositories/prisma-testimonial.repository';
export { testimonialSchemas } from './presentation/schemas/testimonial.schemas';
export { TestimonialSerializer } from './presentation/serializers/testimonial.serializer';
