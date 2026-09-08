import type { Request, Response } from 'express';

import { SYSTEM_ROLES } from '@/shared/constants/app.constants';
import { asyncHandler, response } from '@/shared/utils/http/responses/helpers';

import type { CreateCertificationCommand } from '../../application/commands/create-certification.command';
import type { DeleteCertificationCommand } from '../../application/commands/delete-certification.command';
import type { UpdateCertificationCommand } from '../../application/commands/update-certification.command';
import type { GetCertificationQuery } from '../../application/queries/get-certification.query';
import type { ListCertificationsQuery } from '../../application/queries/list-certifications.query';
import type { CertificationRbacPort } from '../../application/services/rbac.port';
import { CertificationSerializer } from '../serializers/certification.serializer';

type AuthenticatedRequest = Request & {
  user?: { id: string };
};

export type CertificationControllerDeps = {
  createCertification: CreateCertificationCommand;
  updateCertification: UpdateCertificationCommand;
  deleteCertification: DeleteCertificationCommand;
  getCertification: GetCertificationQuery;
  listCertifications: ListCertificationsQuery;
  rbac: CertificationRbacPort;
};

/**
 * Thin Express handlers — HTTP concerns only; business rules live in commands/queries.
 */
export function createCertificationController(deps: CertificationControllerDeps) {
  const isAdmin = async (userId: string): Promise<boolean> =>
    deps.rbac.hasAnyRole(userId, [SYSTEM_ROLES.ADMIN, SYSTEM_ROLES.SUPER_ADMIN]);

  const list = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await deps.listCertifications.execute({ page, limit });
    return response.ok(req, res, CertificationSerializer.list(result), 'Certifications retrieved');
  });

  const getById = asyncHandler(async (req: Request, res: Response) => {
    const item = await deps.getCertification.execute({ id: req.params.certificationId });
    return response.ok(req, res, CertificationSerializer.one(item), 'Certification retrieved');
  });

  const create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const item = await deps.createCertification.execute({
      name: req.body.name,
      issuer: req.body.issuer,
      year: req.body.year,
      link: req.body.link,
      sortOrder: req.body.sortOrder,
      ownerId: req.user!.id,
    });
    return response.created(req, res, CertificationSerializer.one(item), 'Certification created');
  });

  const update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const admin = await isAdmin(req.user!.id);
    const item = await deps.updateCertification.execute({
      id: req.params.certificationId,
      actorId: req.user!.id,
      isAdmin: admin,
      name: req.body.name,
      issuer: req.body.issuer,
      year: req.body.year,
      link: req.body.link,
      sortOrder: req.body.sortOrder,
    });
    return response.ok(req, res, CertificationSerializer.one(item), 'Certification updated');
  });

  const remove = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const admin = await isAdmin(req.user!.id);
    await deps.deleteCertification.execute({
      id: req.params.certificationId,
      actorId: req.user!.id,
      isAdmin: admin,
    });
    return response.ok(req, res, null, 'Certification deleted');
  });

  return { list, getById, create, update, remove };
}

export type CertificationController = ReturnType<typeof createCertificationController>;
