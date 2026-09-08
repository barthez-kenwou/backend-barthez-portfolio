import type { Router } from 'express';

import { type AuditPort, auditRepository } from '@/shared/infrastructure/audit';

import { CreateLanguageCommand } from './application/commands/create-language.command';
import { DeleteLanguageCommand } from './application/commands/delete-language.command';
import { UpdateLanguageCommand } from './application/commands/update-language.command';
import { GetLanguageQuery } from './application/queries/get-language.query';
import { ListLanguagesQuery } from './application/queries/list-languages.query';
import type { LanguageRbacPort } from './application/services/rbac.port';
import type { LanguageRepositoryPort } from './domain/repositories/language.repository';
import { createLanguageRbacAdapter } from './infrastructure/providers/legacy-adapters';
import { PrismaLanguageRepository } from './infrastructure/repositories/prisma-language.repository';
import {
  type LanguageController,
  createLanguageController,
} from './presentation/controllers/language.controller';
import { createLanguageRoutes } from './presentation/routes/language.routes';

/**
 * Explicit dependencies for the Language module.
 */
export type LanguageModuleDeps = {
  languageRepository: LanguageRepositoryPort;
  rbac: LanguageRbacPort;
  audit?: AuditPort;
};

export type LanguageModule = {
  deps: LanguageModuleDeps;
  useCases: {
    createLanguage: CreateLanguageCommand;
    updateLanguage: UpdateLanguageCommand;
    deleteLanguage: DeleteLanguageCommand;
    getLanguage: GetLanguageQuery;
    listLanguages: ListLanguagesQuery;
  };
  controller: LanguageController;
  router: Router;
};

/**
 * Builds default infrastructure adapters.
 * Override any key when wiring a test double or alternate provider.
 */
export function createDefaultLanguageDeps(
  overrides: Partial<LanguageModuleDeps> = {},
): LanguageModuleDeps {
  return {
    languageRepository: overrides.languageRepository ?? new PrismaLanguageRepository(),
    rbac: overrides.rbac ?? createLanguageRbacAdapter(),
    audit: overrides.audit ?? auditRepository,
  };
}

/**
 * Composition root for the Language bounded context.
 */
export function createLanguageModule(deps: LanguageModuleDeps): LanguageModule {
  const useCases = {
    createLanguage: new CreateLanguageCommand(deps),
    updateLanguage: new UpdateLanguageCommand(deps),
    deleteLanguage: new DeleteLanguageCommand(deps),
    getLanguage: new GetLanguageQuery(deps),
    listLanguages: new ListLanguagesQuery(deps),
  };

  const controller = createLanguageController({
    ...useCases,
    rbac: deps.rbac,
  });

  const router = createLanguageRoutes(controller);

  return { deps, useCases, controller, router };
}

/** Convenience: fully wired Express router for route registration. */
export function createLanguageRouter(overrides: Partial<LanguageModuleDeps> = {}): Router {
  return createLanguageModule(createDefaultLanguageDeps(overrides)).router;
}

export type { LanguageEntity } from './domain/entities/language.entity';
export { PrismaLanguageRepository } from './infrastructure/repositories/prisma-language.repository';
export { languageSchemas } from './presentation/schemas/language.schemas';
export { LanguageSerializer } from './presentation/serializers/language.serializer';
