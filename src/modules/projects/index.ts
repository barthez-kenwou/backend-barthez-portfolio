import type { Router } from 'express';

import { type AuditPort, auditRepository } from '@/shared/infrastructure/audit';

import { CreateProjectCommand } from './application/commands/create-project.command';
import { DeleteProjectCommand } from './application/commands/delete-project.command';
import { UpdateProjectCommand } from './application/commands/update-project.command';
import { GetProjectQuery } from './application/queries/get-project.query';
import { ListProjectsQuery } from './application/queries/list-projects.query';
import type { ProjectRbacPort } from './application/services/rbac.port';
import type { ProjectRepositoryPort } from './domain/repositories/project.repository';
import { createProjectRbacAdapter } from './infrastructure/providers/legacy-adapters';
import { PrismaProjectRepository } from './infrastructure/repositories/prisma-project.repository';
import {
  type ProjectController,
  createProjectController,
} from './presentation/controllers/project.controller';
import { createProjectRoutes } from './presentation/routes/project.routes';

/**
 * Explicit dependencies for the Project module.
 */
export type ProjectModuleDeps = {
  projectRepository: ProjectRepositoryPort;
  rbac: ProjectRbacPort;
  audit?: AuditPort;
};

export type ProjectModule = {
  deps: ProjectModuleDeps;
  useCases: {
    createProject: CreateProjectCommand;
    updateProject: UpdateProjectCommand;
    deleteProject: DeleteProjectCommand;
    getProject: GetProjectQuery;
    listProjects: ListProjectsQuery;
  };
  controller: ProjectController;
  router: Router;
};

/**
 * Builds default infrastructure adapters.
 * Override any key when wiring a test double or alternate provider.
 */
export function createDefaultProjectDeps(
  overrides: Partial<ProjectModuleDeps> = {},
): ProjectModuleDeps {
  return {
    projectRepository: overrides.projectRepository ?? new PrismaProjectRepository(),
    rbac: overrides.rbac ?? createProjectRbacAdapter(),
    audit: overrides.audit ?? auditRepository,
  };
}

/**
 * Composition root for the Project bounded context.
 */
export function createProjectModule(deps: ProjectModuleDeps): ProjectModule {
  const useCases = {
    createProject: new CreateProjectCommand(deps),
    updateProject: new UpdateProjectCommand(deps),
    deleteProject: new DeleteProjectCommand(deps),
    getProject: new GetProjectQuery(deps),
    listProjects: new ListProjectsQuery(deps),
  };

  const controller = createProjectController({
    ...useCases,
    rbac: deps.rbac,
  });

  const router = createProjectRoutes(controller);

  return { deps, useCases, controller, router };
}

/** Convenience: fully wired Express router for route registration. */
export function createProjectRouter(overrides: Partial<ProjectModuleDeps> = {}): Router {
  return createProjectModule(createDefaultProjectDeps(overrides)).router;
}

export type { ProjectEntity } from './domain/entities/project.entity';
export { PrismaProjectRepository } from './infrastructure/repositories/prisma-project.repository';
export { projectSchemas } from './presentation/schemas/project.schemas';
export { ProjectSerializer } from './presentation/serializers/project.serializer';
