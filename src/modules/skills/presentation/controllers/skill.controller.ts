import type { Request, Response } from 'express';

import { SYSTEM_ROLES } from '@/shared/constants/app.constants';
import { asyncHandler, response } from '@/shared/utils/http/responses/helpers';

import type { CreateSkillCommand } from '../../application/commands/create-skill.command';
import type { DeleteSkillCommand } from '../../application/commands/delete-skill.command';
import type { UpdateSkillCommand } from '../../application/commands/update-skill.command';
import type { GetSkillQuery } from '../../application/queries/get-skill.query';
import type { ListSkillsQuery } from '../../application/queries/list-skills.query';
import type { SkillRbacPort } from '../../application/services/rbac.port';
import { SkillSerializer } from '../serializers/skill.serializer';

type AuthenticatedRequest = Request & {
  user?: { id: string };
};

export type SkillControllerDeps = {
  createSkill: CreateSkillCommand;
  updateSkill: UpdateSkillCommand;
  deleteSkill: DeleteSkillCommand;
  getSkill: GetSkillQuery;
  listSkills: ListSkillsQuery;
  rbac: SkillRbacPort;
};

/**
 * Thin Express handlers — HTTP concerns only; business rules live in commands/queries.
 */
export function createSkillController(deps: SkillControllerDeps) {
  const isAdmin = async (userId: string): Promise<boolean> =>
    deps.rbac.hasAnyRole(userId, [SYSTEM_ROLES.ADMIN, SYSTEM_ROLES.SUPER_ADMIN]);

  const list = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await deps.listSkills.execute({ page, limit });
    return response.ok(req, res, SkillSerializer.list(result), 'Skills retrieved');
  });

  const getById = asyncHandler(async (req: Request, res: Response) => {
    const item = await deps.getSkill.execute({ id: req.params.skillId });
    return response.ok(req, res, SkillSerializer.one(item), 'Skill retrieved');
  });

  const create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const item = await deps.createSkill.execute({
      name: req.body.name,
      category: req.body.category,
      level: req.body.level,
      icon: req.body.icon,
      sortOrder: req.body.sortOrder,
      ownerId: req.user!.id,
    });
    return response.created(req, res, SkillSerializer.one(item), 'Skill created');
  });

  const update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const admin = await isAdmin(req.user!.id);
    const item = await deps.updateSkill.execute({
      id: req.params.skillId,
      actorId: req.user!.id,
      isAdmin: admin,
      name: req.body.name,
      category: req.body.category,
      level: req.body.level,
      icon: req.body.icon,
      sortOrder: req.body.sortOrder,
    });
    return response.ok(req, res, SkillSerializer.one(item), 'Skill updated');
  });

  const remove = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const admin = await isAdmin(req.user!.id);
    await deps.deleteSkill.execute({
      id: req.params.skillId,
      actorId: req.user!.id,
      isAdmin: admin,
    });
    return response.ok(req, res, null, 'Skill deleted');
  });

  return { list, getById, create, update, remove };
}

export type SkillController = ReturnType<typeof createSkillController>;
