import type { NextFunction, Request, Response } from 'express';

import {
  authenticate,
  requireActive,
  requirePermission,
  requireVerified,
} from '@/app/middleware/authenticate.middleware';
import type { AuthenticatedRequest } from '@/modules/auth/presentation/types/authenticated-request';
import { SYSTEM_ROLES } from '@/shared/constants/app.constants';
import { asyncHandler, response } from '@/shared/utils/http/responses/helpers';

import type { CreateProjectCommand } from '../../application/commands/create-project.command';
import type { DeleteProjectCommand } from '../../application/commands/delete-project.command';
import type { UpdateProjectCommand } from '../../application/commands/update-project.command';
import type { GetProjectQuery } from '../../application/queries/get-project.query';
import type { ListProjectsQuery } from '../../application/queries/list-projects.query';
import type { ProjectRbacPort } from '../../application/services/rbac.port';
import { ProjectSerializer } from '../serializers/project.serializer';

type AuthRequest = Request & {
  user?: { id: string };
};

export type ProjectControllerDeps = {
  createProject: CreateProjectCommand;
  updateProject: UpdateProjectCommand;
  deleteProject: DeleteProjectCommand;
  getProject: GetProjectQuery;
  listProjects: ListProjectsQuery;
  rbac: ProjectRbacPort;
};

const parseBool = (value: unknown): boolean | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return undefined;
};

/**
 * When includeUnpublished=true, require auth + project:read.
 */
export const requireAuthForUnpublishedList = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (String(req.query.includeUnpublished) !== 'true') {
    next();
    return;
  }

  void authenticate(req, res, (err?: unknown) => {
    if (err) {
      next(err);
      return;
    }
    void requireVerified(req, res, (err2?: unknown) => {
      if (err2) {
        next(err2);
        return;
      }
      void requireActive(req, res, (err3?: unknown) => {
        if (err3) {
          next(err3);
          return;
        }
        void requirePermission('project:read')(req, res, next);
      });
    });
  });
};

/**
 * Thin Express handlers — HTTP concerns only; business rules live in commands/queries.
 */
export function createProjectController(deps: ProjectControllerDeps) {
  const isAdmin = async (userId: string): Promise<boolean> =>
    deps.rbac.hasAnyRole(userId, [SYSTEM_ROLES.ADMIN, SYSTEM_ROLES.SUPER_ADMIN]);

  const list = asyncHandler(async (req: Request, res: Response) => {
    const includeUnpublished = parseBool(req.query.includeUnpublished) === true;
    const result = await deps.listProjects.execute({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      isPublished: parseBool(req.query.isPublished),
      isFeatured: parseBool(req.query.isFeatured),
      category: req.query.category ? String(req.query.category) : undefined,
      includeUnpublished,
    });
    return response.ok(
      req,
      res,
      ProjectSerializer.list(result, { redactConfidential: !includeUnpublished }),
      'Projects retrieved',
    );
  });

  const getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const adminViewer = req.user?.id ? await isAdmin(req.user.id) : false;
    const item = await deps.getProject.execute({
      id: req.params.projectId,
      allowUnpublished: adminViewer,
    });
    return response.ok(
      req,
      res,
      ProjectSerializer.one(item, { redactConfidential: !adminViewer }),
      'Project retrieved',
    );
  });

  const create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const item = await deps.createProject.execute({
      ...req.body,
      ownerId: req.user!.id,
    });
    return response.created(req, res, ProjectSerializer.one(item), 'Project created');
  });

  const update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const admin = await isAdmin(req.user!.id);
    const item = await deps.updateProject.execute({
      id: req.params.projectId,
      actorId: req.user!.id,
      isAdmin: admin,
      ...req.body,
    });
    return response.ok(req, res, ProjectSerializer.one(item), 'Project updated');
  });

  const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
    const admin = await isAdmin(req.user!.id);
    await deps.deleteProject.execute({
      id: req.params.projectId,
      actorId: req.user!.id,
      isAdmin: admin,
    });
    return response.ok(req, res, null, 'Project deleted');
  });

  return { list, getById, create, update, remove };
}

export type ProjectController = ReturnType<typeof createProjectController>;
