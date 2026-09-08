import type { Router } from 'express';

import { type AuditPort, auditRepository } from '@/shared/infrastructure/audit';

import { CreateCertificationCommand } from './application/commands/create-certification.command';
import { DeleteCertificationCommand } from './application/commands/delete-certification.command';
import { UpdateCertificationCommand } from './application/commands/update-certification.command';
import { GetCertificationQuery } from './application/queries/get-certification.query';
import { ListCertificationsQuery } from './application/queries/list-certifications.query';
import type { CertificationRbacPort } from './application/services/rbac.port';
import type { CertificationRepositoryPort } from './domain/repositories/certification.repository';
import { createCertificationRbacAdapter } from './infrastructure/providers/legacy-adapters';
import { PrismaCertificationRepository } from './infrastructure/repositories/prisma-certification.repository';
import {
  type CertificationController,
  createCertificationController,
} from './presentation/controllers/certification.controller';
import { createCertificationRoutes } from './presentation/routes/certification.routes';

/**
 * Explicit dependencies for the Certification module.
 */
export type CertificationModuleDeps = {
  certificationRepository: CertificationRepositoryPort;
  rbac: CertificationRbacPort;
  audit?: AuditPort;
};

export type CertificationModule = {
  deps: CertificationModuleDeps;
  useCases: {
    createCertification: CreateCertificationCommand;
    updateCertification: UpdateCertificationCommand;
    deleteCertification: DeleteCertificationCommand;
    getCertification: GetCertificationQuery;
    listCertifications: ListCertificationsQuery;
  };
  controller: CertificationController;
  router: Router;
};

/**
 * Builds default infrastructure adapters.
 * Override any key when wiring a test double or alternate provider.
 */
export function createDefaultCertificationDeps(
  overrides: Partial<CertificationModuleDeps> = {},
): CertificationModuleDeps {
  return {
    certificationRepository:
      overrides.certificationRepository ?? new PrismaCertificationRepository(),
    rbac: overrides.rbac ?? createCertificationRbacAdapter(),
    audit: overrides.audit ?? auditRepository,
  };
}

/**
 * Composition root for the Certification bounded context.
 */
export function createCertificationModule(deps: CertificationModuleDeps): CertificationModule {
  const useCases = {
    createCertification: new CreateCertificationCommand(deps),
    updateCertification: new UpdateCertificationCommand(deps),
    deleteCertification: new DeleteCertificationCommand(deps),
    getCertification: new GetCertificationQuery(deps),
    listCertifications: new ListCertificationsQuery(deps),
  };

  const controller = createCertificationController({
    ...useCases,
    rbac: deps.rbac,
  });

  const router = createCertificationRoutes(controller);

  return { deps, useCases, controller, router };
}

/** Convenience: fully wired Express router for route registration. */
export function createCertificationRouter(
  overrides: Partial<CertificationModuleDeps> = {},
): Router {
  return createCertificationModule(createDefaultCertificationDeps(overrides)).router;
}

export type { CertificationEntity } from './domain/entities/certification.entity';
export { PrismaCertificationRepository } from './infrastructure/repositories/prisma-certification.repository';
export { certificationSchemas } from './presentation/schemas/certification.schemas';
export { CertificationSerializer } from './presentation/serializers/certification.serializer';
