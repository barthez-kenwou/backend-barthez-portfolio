import type { Router } from 'express';

import { type AuditPort, auditRepository } from '@/shared/infrastructure/audit';

import { CreateReferenceCommand } from './application/commands/create-reference.command';
import { DeleteReferenceCommand } from './application/commands/delete-reference.command';
import { UpdateReferenceCommand } from './application/commands/update-reference.command';
import { GetReferenceQuery } from './application/queries/get-reference.query';
import { ListReferencesQuery } from './application/queries/list-references.query';
import type { ReferenceRbacPort } from './application/services/rbac.port';
import type { ReferenceRepositoryPort } from './domain/repositories/reference.repository';
import { createReferenceRbacAdapter } from './infrastructure/providers/legacy-adapters';
import { PrismaReferenceRepository } from './infrastructure/repositories/prisma-reference.repository';
import {
  type ReferenceController,
  createReferenceController,
} from './presentation/controllers/reference.controller';
import { createReferenceRoutes } from './presentation/routes/reference.routes';

/**
 * Explicit dependencies for the Reference module.
 */
export type ReferenceModuleDeps = {
  referenceRepository: ReferenceRepositoryPort;
  rbac: ReferenceRbacPort;
  audit?: AuditPort;
};

export type ReferenceModule = {
  deps: ReferenceModuleDeps;
  useCases: {
    createReference: CreateReferenceCommand;
    updateReference: UpdateReferenceCommand;
    deleteReference: DeleteReferenceCommand;
    getReference: GetReferenceQuery;
    listReferences: ListReferencesQuery;
  };
  controller: ReferenceController;
  router: Router;
};

/**
 * Builds default infrastructure adapters.
 * Override any key when wiring a test double or alternate provider.
 */
export function createDefaultReferenceDeps(
  overrides: Partial<ReferenceModuleDeps> = {},
): ReferenceModuleDeps {
  return {
    referenceRepository: overrides.referenceRepository ?? new PrismaReferenceRepository(),
    rbac: overrides.rbac ?? createReferenceRbacAdapter(),
    audit: overrides.audit ?? auditRepository,
  };
}

/**
 * Composition root for the Reference bounded context.
 */
export function createReferenceModule(deps: ReferenceModuleDeps): ReferenceModule {
  const useCases = {
    createReference: new CreateReferenceCommand(deps),
    updateReference: new UpdateReferenceCommand(deps),
    deleteReference: new DeleteReferenceCommand(deps),
    getReference: new GetReferenceQuery(deps),
    listReferences: new ListReferencesQuery(deps),
  };

  const controller = createReferenceController({
    ...useCases,
    rbac: deps.rbac,
  });

  const router = createReferenceRoutes(controller);

  return { deps, useCases, controller, router };
}

/** Convenience: fully wired Express router for route registration. */
export function createReferenceRouter(overrides: Partial<ReferenceModuleDeps> = {}): Router {
  return createReferenceModule(createDefaultReferenceDeps(overrides)).router;
}

export type { ReferenceEntity } from './domain/entities/reference.entity';
export { PrismaReferenceRepository } from './infrastructure/repositories/prisma-reference.repository';
export { referenceSchemas } from './presentation/schemas/reference.schemas';
export { ReferenceSerializer } from './presentation/serializers/reference.serializer';
