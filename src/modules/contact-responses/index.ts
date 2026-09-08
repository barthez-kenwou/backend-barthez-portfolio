import type { Router } from 'express';

import { type AuditPort, auditRepository } from '@/shared/infrastructure/audit';

import { DeleteContactResponseCommand } from './application/commands/delete-contact-response.command';
import { SubmitContactResponseCommand } from './application/commands/submit-contact-response.command';
import { UpdateContactResponseCommand } from './application/commands/update-contact-response.command';
import { GetContactResponseQuery } from './application/queries/get-contact-response.query';
import { ListContactResponsesQuery } from './application/queries/list-contact-responses.query';
import type { ContactResponseRbacPort } from './application/services/rbac.port';
import type { ContactResponseRepositoryPort } from './domain/repositories/contact-response.repository';
import { createContactResponseRbacAdapter } from './infrastructure/providers/legacy-adapters';
import { PrismaContactResponseRepository } from './infrastructure/repositories/prisma-contact-response.repository';
import {
  type ContactResponseController,
  createContactResponseController,
} from './presentation/controllers/contact-response.controller';
import { createContactResponseRoutes } from './presentation/routes/contact-response.routes';

export type ContactResponseModuleDeps = {
  contactResponseRepository: ContactResponseRepositoryPort;
  rbac: ContactResponseRbacPort;
  audit?: AuditPort;
};

export type ContactResponseModule = {
  deps: ContactResponseModuleDeps;
  useCases: {
    submitContactResponse: SubmitContactResponseCommand;
    updateContactResponse: UpdateContactResponseCommand;
    deleteContactResponse: DeleteContactResponseCommand;
    getContactResponse: GetContactResponseQuery;
    listContactResponses: ListContactResponsesQuery;
  };
  controller: ContactResponseController;
  router: Router;
};

export function createDefaultContactResponseDeps(
  overrides: Partial<ContactResponseModuleDeps> = {},
): ContactResponseModuleDeps {
  return {
    contactResponseRepository:
      overrides.contactResponseRepository ?? new PrismaContactResponseRepository(),
    rbac: overrides.rbac ?? createContactResponseRbacAdapter(),
    audit: overrides.audit ?? auditRepository,
  };
}

export function createContactResponseModule(
  deps: ContactResponseModuleDeps,
): ContactResponseModule {
  const useCases = {
    submitContactResponse: new SubmitContactResponseCommand(deps),
    updateContactResponse: new UpdateContactResponseCommand(deps),
    deleteContactResponse: new DeleteContactResponseCommand(deps),
    getContactResponse: new GetContactResponseQuery(deps),
    listContactResponses: new ListContactResponsesQuery(deps),
  };

  const controller = createContactResponseController(useCases);
  const router = createContactResponseRoutes(controller);

  return { deps, useCases, controller, router };
}

export function createContactResponseRouter(
  overrides: Partial<ContactResponseModuleDeps> = {},
): Router {
  return createContactResponseModule(createDefaultContactResponseDeps(overrides)).router;
}

export type { ContactResponseEntity } from './domain/entities/contact-response.entity';
export { PrismaContactResponseRepository } from './infrastructure/repositories/prisma-contact-response.repository';
export { contactResponseSchemas } from './presentation/schemas/contact-response.schemas';
export { ContactResponseSerializer } from './presentation/serializers/contact-response.serializer';
