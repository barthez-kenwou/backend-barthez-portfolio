import type { Request, Response } from 'express';

import { SYSTEM_ROLES } from '@/shared/constants/app.constants';
import { asyncHandler, response } from '@/shared/utils/http/responses/helpers';

import type { CreateReferenceCommand } from '../../application/commands/create-reference.command';
import type { DeleteReferenceCommand } from '../../application/commands/delete-reference.command';
import type { UpdateReferenceCommand } from '../../application/commands/update-reference.command';
import type { GetReferenceQuery } from '../../application/queries/get-reference.query';
import type { ListReferencesQuery } from '../../application/queries/list-references.query';
import type { ReferenceRbacPort } from '../../application/services/rbac.port';
import { ReferenceSerializer } from '../serializers/reference.serializer';

type AuthenticatedRequest = Request & {
  user?: { id: string };
};

export type ReferenceControllerDeps = {
  createReference: CreateReferenceCommand;
  updateReference: UpdateReferenceCommand;
  deleteReference: DeleteReferenceCommand;
  getReference: GetReferenceQuery;
  listReferences: ListReferencesQuery;
  rbac: ReferenceRbacPort;
};

/**
 * Thin Express handlers — HTTP concerns only; business rules live in commands/queries.
 */
export function createReferenceController(deps: ReferenceControllerDeps) {
  const isAdmin = async (userId: string): Promise<boolean> =>
    deps.rbac.hasAnyRole(userId, [SYSTEM_ROLES.ADMIN, SYSTEM_ROLES.SUPER_ADMIN]);

  const list = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await deps.listReferences.execute({ page, limit });
    return response.ok(req, res, ReferenceSerializer.list(result), 'References retrieved');
  });

  const getById = asyncHandler(async (req: Request, res: Response) => {
    const item = await deps.getReference.execute({ id: req.params.referenceId });
    return response.ok(req, res, ReferenceSerializer.one(item), 'Reference retrieved');
  });

  const create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const item = await deps.createReference.execute({
      name: req.body.name,
      roleFr: req.body.roleFr,
      roleEn: req.body.roleEn,
      company: req.body.company,
      email: req.body.email,
      phone: req.body.phone,
      sortOrder: req.body.sortOrder,
      ownerId: req.user!.id,
    });
    return response.created(req, res, ReferenceSerializer.one(item), 'Reference created');
  });

  const update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const admin = await isAdmin(req.user!.id);
    const item = await deps.updateReference.execute({
      id: req.params.referenceId,
      actorId: req.user!.id,
      isAdmin: admin,
      name: req.body.name,
      roleFr: req.body.roleFr,
      roleEn: req.body.roleEn,
      company: req.body.company,
      email: req.body.email,
      phone: req.body.phone,
      sortOrder: req.body.sortOrder,
    });
    return response.ok(req, res, ReferenceSerializer.one(item), 'Reference updated');
  });

  const remove = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const admin = await isAdmin(req.user!.id);
    await deps.deleteReference.execute({
      id: req.params.referenceId,
      actorId: req.user!.id,
      isAdmin: admin,
    });
    return response.ok(req, res, null, 'Reference deleted');
  });

  return { list, getById, create, update, remove };
}

export type ReferenceController = ReturnType<typeof createReferenceController>;
