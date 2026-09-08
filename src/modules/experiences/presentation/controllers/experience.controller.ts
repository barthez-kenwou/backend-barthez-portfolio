import type { Request, Response } from 'express';

import { SYSTEM_ROLES } from '@/shared/constants/app.constants';
import { asyncHandler, response } from '@/shared/utils/http/responses/helpers';

import type { CreateExperienceCommand } from '../../application/commands/create-experience.command';
import type { DeleteExperienceCommand } from '../../application/commands/delete-experience.command';
import type { UpdateExperienceCommand } from '../../application/commands/update-experience.command';
import type { GetExperienceQuery } from '../../application/queries/get-experience.query';
import type { ListExperiencesQuery } from '../../application/queries/list-experiences.query';
import type { ExperienceRbacPort } from '../../application/services/rbac.port';
import { ExperienceSerializer } from '../serializers/experience.serializer';

type AuthenticatedRequest = Request & {
  user?: { id: string };
};

export type ExperienceControllerDeps = {
  createExperience: CreateExperienceCommand;
  updateExperience: UpdateExperienceCommand;
  deleteExperience: DeleteExperienceCommand;
  getExperience: GetExperienceQuery;
  listExperiences: ListExperiencesQuery;
  rbac: ExperienceRbacPort;
};

/**
 * Thin Express handlers — HTTP concerns only; business rules live in commands/queries.
 */
export function createExperienceController(deps: ExperienceControllerDeps) {
  const isAdmin = async (userId: string): Promise<boolean> =>
    deps.rbac.hasAnyRole(userId, [SYSTEM_ROLES.ADMIN, SYSTEM_ROLES.SUPER_ADMIN]);

  const list = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await deps.listExperiences.execute({ page, limit });
    return response.ok(req, res, ExperienceSerializer.list(result), 'Experiences retrieved');
  });

  const getById = asyncHandler(async (req: Request, res: Response) => {
    const item = await deps.getExperience.execute({ id: req.params.experienceId });
    return response.ok(req, res, ExperienceSerializer.one(item), 'Experience retrieved');
  });

  const create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const item = await deps.createExperience.execute({
      titleFr: req.body.titleFr,
      titleEn: req.body.titleEn,
      companyFr: req.body.companyFr,
      companyEn: req.body.companyEn,
      period: req.body.period,
      descriptionFr: req.body.descriptionFr,
      descriptionEn: req.body.descriptionEn,
      sortOrder: req.body.sortOrder,
      ownerId: req.user!.id,
    });
    return response.created(req, res, ExperienceSerializer.one(item), 'Experience created');
  });

  const update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const admin = await isAdmin(req.user!.id);
    const item = await deps.updateExperience.execute({
      id: req.params.experienceId,
      actorId: req.user!.id,
      isAdmin: admin,
      titleFr: req.body.titleFr,
      titleEn: req.body.titleEn,
      companyFr: req.body.companyFr,
      companyEn: req.body.companyEn,
      period: req.body.period,
      descriptionFr: req.body.descriptionFr,
      descriptionEn: req.body.descriptionEn,
      sortOrder: req.body.sortOrder,
    });
    return response.ok(req, res, ExperienceSerializer.one(item), 'Experience updated');
  });

  const remove = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const admin = await isAdmin(req.user!.id);
    await deps.deleteExperience.execute({
      id: req.params.experienceId,
      actorId: req.user!.id,
      isAdmin: admin,
    });
    return response.ok(req, res, null, 'Experience deleted');
  });

  return { list, getById, create, update, remove };
}

export type ExperienceController = ReturnType<typeof createExperienceController>;
