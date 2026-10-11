import type { Router } from 'express';

import { type AuditPort, auditRepository } from '@/shared/infrastructure/audit';

import { CreatePartnerCommand } from './application/commands/create-partner.command';
import { DeletePartnerCommand } from './application/commands/delete-partner.command';
import { UpdatePartnerCommand } from './application/commands/update-partner.command';
import { GetPartnerQuery } from './application/queries/get-partner.query';
import { ListPartnersQuery } from './application/queries/list-partners.query';
import type { PartnerRbacPort } from './application/services/rbac.port';
import type { PartnerRepositoryPort } from './domain/repositories/partner.repository';
import { createPartnerRbacAdapter } from './infrastructure/providers/legacy-adapters';
import { PrismaPartnerRepository } from './infrastructure/repositories/prisma-partner.repository';
import {
  type PartnerController,
  createPartnerController,
} from './presentation/controllers/partner.controller';
import { createPartnerRoutes } from './presentation/routes/partner.routes';

export type PartnerModuleDeps = {
  partnerRepository: PartnerRepositoryPort;
  rbac: PartnerRbacPort;
  audit?: AuditPort;
};

export type PartnerModule = {
  deps: PartnerModuleDeps;
  useCases: {
    createPartner: CreatePartnerCommand;
    updatePartner: UpdatePartnerCommand;
    deletePartner: DeletePartnerCommand;
    getPartner: GetPartnerQuery;
    listPartners: ListPartnersQuery;
  };
  controller: PartnerController;
  router: Router;
};

export function createDefaultPartnerDeps(
  overrides: Partial<PartnerModuleDeps> = {},
): PartnerModuleDeps {
  return {
    partnerRepository: overrides.partnerRepository ?? new PrismaPartnerRepository(),
    rbac: overrides.rbac ?? createPartnerRbacAdapter(),
    audit: overrides.audit ?? auditRepository,
  };
}

export function createPartnerModule(deps: PartnerModuleDeps): PartnerModule {
  const useCases = {
    createPartner: new CreatePartnerCommand(deps),
    updatePartner: new UpdatePartnerCommand(deps),
    deletePartner: new DeletePartnerCommand(deps),
    getPartner: new GetPartnerQuery(deps),
    listPartners: new ListPartnersQuery(deps),
  };

  const controller = createPartnerController({
    ...useCases,
    rbac: deps.rbac,
  });

  const router = createPartnerRoutes(controller);

  return { deps, useCases, controller, router };
}

export function createPartnerRouter(overrides: Partial<PartnerModuleDeps> = {}): Router {
  return createPartnerModule(createDefaultPartnerDeps(overrides)).router;
}

export type { PartnerEntity } from './domain/entities/partner.entity';
export { PrismaPartnerRepository } from './infrastructure/repositories/prisma-partner.repository';
export { partnerSchemas } from './presentation/schemas/partner.schemas';
export { PartnerSerializer } from './presentation/serializers/partner.serializer';
