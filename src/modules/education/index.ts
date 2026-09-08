import type { Router } from 'express';

import { type AuditPort, auditRepository } from '@/shared/infrastructure/audit';

import { CreateEducationCommand } from './application/commands/create-education.command';
import { DeleteEducationCommand } from './application/commands/delete-education.command';
import { UpdateEducationCommand } from './application/commands/update-education.command';
import { GetEducationQuery } from './application/queries/get-education.query';
import { ListEducationQuery } from './application/queries/list-education.query';
import type { EducationRbacPort } from './application/services/rbac.port';
import type { EducationRepositoryPort } from './domain/repositories/education.repository';
import { createEducationRbacAdapter } from './infrastructure/providers/legacy-adapters';
import { PrismaEducationRepository } from './infrastructure/repositories/prisma-education.repository';
import {
  type EducationController,
  createEducationController,
} from './presentation/controllers/education.controller';
import { createEducationRoutes } from './presentation/routes/education.routes';

/**
 * Explicit dependencies for the Education module.
 */
export type EducationModuleDeps = {
  educationRepository: EducationRepositoryPort;
  rbac: EducationRbacPort;
  audit?: AuditPort;
};

export type EducationModule = {
  deps: EducationModuleDeps;
  useCases: {
    createEducation: CreateEducationCommand;
    updateEducation: UpdateEducationCommand;
    deleteEducation: DeleteEducationCommand;
    getEducation: GetEducationQuery;
    listEducation: ListEducationQuery;
  };
  controller: EducationController;
  router: Router;
};

/**
 * Builds default infrastructure adapters.
 * Override any key when wiring a test double or alternate provider.
 */
export function createDefaultEducationDeps(
  overrides: Partial<EducationModuleDeps> = {},
): EducationModuleDeps {
  return {
    educationRepository: overrides.educationRepository ?? new PrismaEducationRepository(),
    rbac: overrides.rbac ?? createEducationRbacAdapter(),
    audit: overrides.audit ?? auditRepository,
  };
}

/**
 * Composition root for the Education bounded context.
 */
export function createEducationModule(deps: EducationModuleDeps): EducationModule {
  const useCases = {
    createEducation: new CreateEducationCommand(deps),
    updateEducation: new UpdateEducationCommand(deps),
    deleteEducation: new DeleteEducationCommand(deps),
    getEducation: new GetEducationQuery(deps),
    listEducation: new ListEducationQuery(deps),
  };

  const controller = createEducationController({
    ...useCases,
    rbac: deps.rbac,
  });

  const router = createEducationRoutes(controller);

  return { deps, useCases, controller, router };
}

/** Convenience: fully wired Express router for route registration. */
export function createEducationRouter(overrides: Partial<EducationModuleDeps> = {}): Router {
  return createEducationModule(createDefaultEducationDeps(overrides)).router;
}

export type { EducationEntity } from './domain/entities/education.entity';
export { PrismaEducationRepository } from './infrastructure/repositories/prisma-education.repository';
export { educationSchemas } from './presentation/schemas/education.schemas';
export { EducationSerializer } from './presentation/serializers/education.serializer';
