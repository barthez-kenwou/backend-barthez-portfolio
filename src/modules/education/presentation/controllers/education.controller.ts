import type { Request, Response } from 'express';

import { SYSTEM_ROLES } from '@/shared/constants/app.constants';
import { asyncHandler, response } from '@/shared/utils/http/responses/helpers';

import type { CreateEducationCommand } from '../../application/commands/create-education.command';
import type { DeleteEducationCommand } from '../../application/commands/delete-education.command';
import type { UpdateEducationCommand } from '../../application/commands/update-education.command';
import type { GetEducationQuery } from '../../application/queries/get-education.query';
import type { ListEducationQuery } from '../../application/queries/list-education.query';
import type { EducationRbacPort } from '../../application/services/rbac.port';
import { EducationSerializer } from '../serializers/education.serializer';

type AuthenticatedRequest = Request & {
  user?: { id: string };
};

export type EducationControllerDeps = {
  createEducation: CreateEducationCommand;
  updateEducation: UpdateEducationCommand;
  deleteEducation: DeleteEducationCommand;
  getEducation: GetEducationQuery;
  listEducation: ListEducationQuery;
  rbac: EducationRbacPort;
};

/**
 * Thin Express handlers — HTTP concerns only; business rules live in commands/queries.
 */
export function createEducationController(deps: EducationControllerDeps) {
  const isAdmin = async (userId: string): Promise<boolean> =>
    deps.rbac.hasAnyRole(userId, [SYSTEM_ROLES.ADMIN, SYSTEM_ROLES.SUPER_ADMIN]);

  const list = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await deps.listEducation.execute({ page, limit });
    return response.ok(req, res, EducationSerializer.list(result), 'Education retrieved');
  });

  const getById = asyncHandler(async (req: Request, res: Response) => {
    const item = await deps.getEducation.execute({ id: req.params.educationId });
    return response.ok(req, res, EducationSerializer.one(item), 'Education retrieved');
  });

  const create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const item = await deps.createEducation.execute({
      degreeFr: req.body.degreeFr,
      degreeEn: req.body.degreeEn,
      school: req.body.school,
      period: req.body.period,
      link: req.body.link,
      sortOrder: req.body.sortOrder,
      ownerId: req.user!.id,
    });
    return response.created(req, res, EducationSerializer.one(item), 'Education created');
  });

  const update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const admin = await isAdmin(req.user!.id);
    const item = await deps.updateEducation.execute({
      id: req.params.educationId,
      actorId: req.user!.id,
      isAdmin: admin,
      degreeFr: req.body.degreeFr,
      degreeEn: req.body.degreeEn,
      school: req.body.school,
      period: req.body.period,
      link: req.body.link,
      sortOrder: req.body.sortOrder,
    });
    return response.ok(req, res, EducationSerializer.one(item), 'Education updated');
  });

  const remove = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const admin = await isAdmin(req.user!.id);
    await deps.deleteEducation.execute({
      id: req.params.educationId,
      actorId: req.user!.id,
      isAdmin: admin,
    });
    return response.ok(req, res, null, 'Education deleted');
  });

  return { list, getById, create, update, remove };
}

export type EducationController = ReturnType<typeof createEducationController>;
