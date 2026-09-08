import type { Request, Response } from 'express';

import { SYSTEM_ROLES } from '@/shared/constants/app.constants';
import { asyncHandler, response } from '@/shared/utils/http/responses/helpers';

import type { CreateAchievementCommand } from '../../application/commands/create-achievement.command';
import type { DeleteAchievementCommand } from '../../application/commands/delete-achievement.command';
import type { UpdateAchievementCommand } from '../../application/commands/update-achievement.command';
import type { GetAchievementQuery } from '../../application/queries/get-achievement.query';
import type { ListAchievementsQuery } from '../../application/queries/list-achievements.query';
import type { AchievementRbacPort } from '../../application/services/rbac.port';
import { AchievementSerializer } from '../serializers/achievement.serializer';

type AuthenticatedRequest = Request & {
  user?: { id: string };
};

export type AchievementControllerDeps = {
  createAchievement: CreateAchievementCommand;
  updateAchievement: UpdateAchievementCommand;
  deleteAchievement: DeleteAchievementCommand;
  getAchievement: GetAchievementQuery;
  listAchievements: ListAchievementsQuery;
  rbac: AchievementRbacPort;
};

/**
 * Thin Express handlers — HTTP concerns only; business rules live in commands/queries.
 */
export function createAchievementController(deps: AchievementControllerDeps) {
  const isAdmin = async (userId: string): Promise<boolean> =>
    deps.rbac.hasAnyRole(userId, [SYSTEM_ROLES.ADMIN, SYSTEM_ROLES.SUPER_ADMIN]);

  const list = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await deps.listAchievements.execute({ page, limit });
    return response.ok(req, res, AchievementSerializer.list(result), 'Achievements retrieved');
  });

  const getById = asyncHandler(async (req: Request, res: Response) => {
    const item = await deps.getAchievement.execute({ id: req.params.achievementId });
    return response.ok(req, res, AchievementSerializer.one(item), 'Achievement retrieved');
  });

  const create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const item = await deps.createAchievement.execute({
      iconKey: req.body.iconKey,
      value: req.body.value,
      labelFr: req.body.labelFr,
      labelEn: req.body.labelEn,
      sortOrder: req.body.sortOrder,
      ownerId: req.user!.id,
    });
    return response.created(req, res, AchievementSerializer.one(item), 'Achievement created');
  });

  const update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const admin = await isAdmin(req.user!.id);
    const item = await deps.updateAchievement.execute({
      id: req.params.achievementId,
      actorId: req.user!.id,
      isAdmin: admin,
      iconKey: req.body.iconKey,
      value: req.body.value,
      labelFr: req.body.labelFr,
      labelEn: req.body.labelEn,
      sortOrder: req.body.sortOrder,
    });
    return response.ok(req, res, AchievementSerializer.one(item), 'Achievement updated');
  });

  const remove = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const admin = await isAdmin(req.user!.id);
    await deps.deleteAchievement.execute({
      id: req.params.achievementId,
      actorId: req.user!.id,
      isAdmin: admin,
    });
    return response.ok(req, res, null, 'Achievement deleted');
  });

  return { list, getById, create, update, remove };
}

export type AchievementController = ReturnType<typeof createAchievementController>;
