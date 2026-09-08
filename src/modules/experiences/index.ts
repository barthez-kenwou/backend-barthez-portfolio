import type { Router } from 'express';

import { type AuditPort, auditRepository } from '@/shared/infrastructure/audit';

import { CreateExperienceCommand } from './application/commands/create-experience.command';
import { DeleteExperienceCommand } from './application/commands/delete-experience.command';
import { UpdateExperienceCommand } from './application/commands/update-experience.command';
import { GetExperienceQuery } from './application/queries/get-experience.query';
import { ListExperiencesQuery } from './application/queries/list-experiences.query';
import type { ExperienceRbacPort } from './application/services/rbac.port';
import type { ExperienceRepositoryPort } from './domain/repositories/experience.repository';
import { createExperienceRbacAdapter } from './infrastructure/providers/legacy-adapters';
import { PrismaExperienceRepository } from './infrastructure/repositories/prisma-experience.repository';
import {
  type ExperienceController,
  createExperienceController,
} from './presentation/controllers/experience.controller';
import { createExperienceRoutes } from './presentation/routes/experience.routes';

/**
 * Explicit dependencies for the Experience module.
 */
export type ExperienceModuleDeps = {
  experienceRepository: ExperienceRepositoryPort;
  rbac: ExperienceRbacPort;
  audit?: AuditPort;
};

export type ExperienceModule = {
  deps: ExperienceModuleDeps;
  useCases: {
    createExperience: CreateExperienceCommand;
    updateExperience: UpdateExperienceCommand;
    deleteExperience: DeleteExperienceCommand;
    getExperience: GetExperienceQuery;
    listExperiences: ListExperiencesQuery;
  };
  controller: ExperienceController;
  router: Router;
};

/**
 * Builds default infrastructure adapters.
 * Override any key when wiring a test double or alternate provider.
 */
export function createDefaultExperienceDeps(
  overrides: Partial<ExperienceModuleDeps> = {},
): ExperienceModuleDeps {
  return {
    experienceRepository: overrides.experienceRepository ?? new PrismaExperienceRepository(),
    rbac: overrides.rbac ?? createExperienceRbacAdapter(),
    audit: overrides.audit ?? auditRepository,
  };
}

/**
 * Composition root for the Experience bounded context.
 */
export function createExperienceModule(deps: ExperienceModuleDeps): ExperienceModule {
  const useCases = {
    createExperience: new CreateExperienceCommand(deps),
    updateExperience: new UpdateExperienceCommand(deps),
    deleteExperience: new DeleteExperienceCommand(deps),
    getExperience: new GetExperienceQuery(deps),
    listExperiences: new ListExperiencesQuery(deps),
  };

  const controller = createExperienceController({
    ...useCases,
    rbac: deps.rbac,
  });

  const router = createExperienceRoutes(controller);

  return { deps, useCases, controller, router };
}

/** Convenience: fully wired Express router for route registration. */
export function createExperienceRouter(overrides: Partial<ExperienceModuleDeps> = {}): Router {
  return createExperienceModule(createDefaultExperienceDeps(overrides)).router;
}

export type { ExperienceEntity } from './domain/entities/experience.entity';
export { PrismaExperienceRepository } from './infrastructure/repositories/prisma-experience.repository';
export { experienceSchemas } from './presentation/schemas/experience.schemas';
export { ExperienceSerializer } from './presentation/serializers/experience.serializer';
