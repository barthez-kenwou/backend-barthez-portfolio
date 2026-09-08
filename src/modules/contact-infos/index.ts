import type { Router } from 'express';

import { type AuditPort, auditRepository } from '@/shared/infrastructure/audit';

import { DeleteContactInfoCommand } from './application/commands/delete-contact-info.command';
import { UpsertContactInfoCommand } from './application/commands/upsert-contact-info.command';
import { GetContactInfoQuery } from './application/queries/get-contact-info.query';
import type { ContactInfoRbacPort } from './application/services/rbac.port';
import type { ContactInfoRepositoryPort } from './domain/repositories/contact-info.repository';
import { createContactInfoRbacAdapter } from './infrastructure/providers/legacy-adapters';
import { PrismaContactInfoRepository } from './infrastructure/repositories/prisma-contact-info.repository';
import {
  type ContactInfoController,
  createContactInfoController,
} from './presentation/controllers/contact-info.controller';
import { createContactInfoRoutes } from './presentation/routes/contact-info.routes';

export type ContactInfoModuleDeps = {
  contactInfoRepository: ContactInfoRepositoryPort;
  rbac: ContactInfoRbacPort;
  audit?: AuditPort;
};

export type ContactInfoModule = {
  deps: ContactInfoModuleDeps;
  useCases: {
    upsertContactInfo: UpsertContactInfoCommand;
    deleteContactInfo: DeleteContactInfoCommand;
    getContactInfo: GetContactInfoQuery;
  };
  controller: ContactInfoController;
  router: Router;
};

export function createDefaultContactInfoDeps(
  overrides: Partial<ContactInfoModuleDeps> = {},
): ContactInfoModuleDeps {
  return {
    contactInfoRepository: overrides.contactInfoRepository ?? new PrismaContactInfoRepository(),
    rbac: overrides.rbac ?? createContactInfoRbacAdapter(),
    audit: overrides.audit ?? auditRepository,
  };
}

export function createContactInfoModule(deps: ContactInfoModuleDeps): ContactInfoModule {
  const useCases = {
    upsertContactInfo: new UpsertContactInfoCommand(deps),
    deleteContactInfo: new DeleteContactInfoCommand(deps),
    getContactInfo: new GetContactInfoQuery(deps),
  };

  const controller = createContactInfoController(useCases);
  const router = createContactInfoRoutes(controller);

  return { deps, useCases, controller, router };
}

export function createContactInfoRouter(overrides: Partial<ContactInfoModuleDeps> = {}): Router {
  return createContactInfoModule(createDefaultContactInfoDeps(overrides)).router;
}

export type { ContactInfoEntity } from './domain/entities/contact-info.entity';
export { PrismaContactInfoRepository } from './infrastructure/repositories/prisma-contact-info.repository';
export { contactInfoSchemas } from './presentation/schemas/contact-info.schemas';
export { ContactInfoSerializer } from './presentation/serializers/contact-info.serializer';
