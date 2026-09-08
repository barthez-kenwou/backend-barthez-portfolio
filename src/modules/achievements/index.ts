import type { Router } from 'express';

import { type AuditPort, auditRepository } from '@/shared/infrastructure/audit';

import { CreateAchievementCommand } from './application/commands/create-achievement.command';
import { DeleteAchievementCommand } from './application/commands/delete-achievement.command';
import { UpdateAchievementCommand } from './application/commands/update-achievement.command';
import { GetAchievementQuery } from './application/queries/get-achievement.query';
import { ListAchievementsQuery } from './application/queries/list-achievements.query';
import type { AchievementRbacPort } from './application/services/rbac.port';
import type { AchievementRepositoryPort } from './domain/repositories/achievement.repository';
import { createAchievementRbacAdapter } from './infrastructure/providers/legacy-adapters';
import { PrismaAchievementRepository } from './infrastructure/repositories/prisma-achievement.repository';
import {
  type AchievementController,
  createAchievementController,
} from './presentation/controllers/achievement.controller';
import { createAchievementRoutes } from './presentation/routes/achievement.routes';

/**
 * Explicit dependencies for the Achievement module.
 */
export type AchievementModuleDeps = {
  achievementRepository: AchievementRepositoryPort;
  rbac: AchievementRbacPort;
  audit?: AuditPort;
};

export type AchievementModule = {
  deps: AchievementModuleDeps;
  useCases: {
    createAchievement: CreateAchievementCommand;
    updateAchievement: UpdateAchievementCommand;
    deleteAchievement: DeleteAchievementCommand;
    getAchievement: GetAchievementQuery;
    listAchievements: ListAchievementsQuery;
  };
  controller: AchievementController;
  router: Router;
};

/**
 * Builds default infrastructure adapters.
 * Override any key when wiring a test double or alternate provider.
 */
export function createDefaultAchievementDeps(
  overrides: Partial<AchievementModuleDeps> = {},
): AchievementModuleDeps {
  return {
    achievementRepository: overrides.achievementRepository ?? new PrismaAchievementRepository(),
    rbac: overrides.rbac ?? createAchievementRbacAdapter(),
    audit: overrides.audit ?? auditRepository,
  };
}

/**
 * Composition root for the Achievement bounded context.
 */
export function createAchievementModule(deps: AchievementModuleDeps): AchievementModule {
  const useCases = {
    createAchievement: new CreateAchievementCommand(deps),
    updateAchievement: new UpdateAchievementCommand(deps),
    deleteAchievement: new DeleteAchievementCommand(deps),
    getAchievement: new GetAchievementQuery(deps),
    listAchievements: new ListAchievementsQuery(deps),
  };

  const controller = createAchievementController({
    ...useCases,
    rbac: deps.rbac,
  });

  const router = createAchievementRoutes(controller);

  return { deps, useCases, controller, router };
}

/** Convenience: fully wired Express router for route registration. */
export function createAchievementRouter(overrides: Partial<AchievementModuleDeps> = {}): Router {
  return createAchievementModule(createDefaultAchievementDeps(overrides)).router;
}

export type { AchievementEntity } from './domain/entities/achievement.entity';
export { PrismaAchievementRepository } from './infrastructure/repositories/prisma-achievement.repository';
export { achievementSchemas } from './presentation/schemas/achievement.schemas';
export { AchievementSerializer } from './presentation/serializers/achievement.serializer';
