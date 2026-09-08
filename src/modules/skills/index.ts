import type { Router } from 'express';

import { type AuditPort, auditRepository } from '@/shared/infrastructure/audit';

import { CreateSkillCommand } from './application/commands/create-skill.command';
import { DeleteSkillCommand } from './application/commands/delete-skill.command';
import { UpdateSkillCommand } from './application/commands/update-skill.command';
import { GetSkillQuery } from './application/queries/get-skill.query';
import { ListSkillsQuery } from './application/queries/list-skills.query';
import type { SkillRbacPort } from './application/services/rbac.port';
import type { SkillRepositoryPort } from './domain/repositories/skill.repository';
import { createSkillRbacAdapter } from './infrastructure/providers/legacy-adapters';
import { PrismaSkillRepository } from './infrastructure/repositories/prisma-skill.repository';
import {
  type SkillController,
  createSkillController,
} from './presentation/controllers/skill.controller';
import { createSkillRoutes } from './presentation/routes/skill.routes';

/**
 * Explicit dependencies for the Skill module.
 */
export type SkillModuleDeps = {
  skillRepository: SkillRepositoryPort;
  rbac: SkillRbacPort;
  audit?: AuditPort;
};

export type SkillModule = {
  deps: SkillModuleDeps;
  useCases: {
    createSkill: CreateSkillCommand;
    updateSkill: UpdateSkillCommand;
    deleteSkill: DeleteSkillCommand;
    getSkill: GetSkillQuery;
    listSkills: ListSkillsQuery;
  };
  controller: SkillController;
  router: Router;
};

/**
 * Builds default infrastructure adapters.
 * Override any key when wiring a test double or alternate provider.
 */
export function createDefaultSkillDeps(overrides: Partial<SkillModuleDeps> = {}): SkillModuleDeps {
  return {
    skillRepository: overrides.skillRepository ?? new PrismaSkillRepository(),
    rbac: overrides.rbac ?? createSkillRbacAdapter(),
    audit: overrides.audit ?? auditRepository,
  };
}

/**
 * Composition root for the Skill bounded context.
 */
export function createSkillModule(deps: SkillModuleDeps): SkillModule {
  const useCases = {
    createSkill: new CreateSkillCommand(deps),
    updateSkill: new UpdateSkillCommand(deps),
    deleteSkill: new DeleteSkillCommand(deps),
    getSkill: new GetSkillQuery(deps),
    listSkills: new ListSkillsQuery(deps),
  };

  const controller = createSkillController({
    ...useCases,
    rbac: deps.rbac,
  });

  const router = createSkillRoutes(controller);

  return { deps, useCases, controller, router };
}

/** Convenience: fully wired Express router for route registration. */
export function createSkillRouter(overrides: Partial<SkillModuleDeps> = {}): Router {
  return createSkillModule(createDefaultSkillDeps(overrides)).router;
}

export type { SkillEntity } from './domain/entities/skill.entity';
export { PrismaSkillRepository } from './infrastructure/repositories/prisma-skill.repository';
export { skillSchemas } from './presentation/schemas/skill.schemas';
export { SkillSerializer } from './presentation/serializers/skill.serializer';
