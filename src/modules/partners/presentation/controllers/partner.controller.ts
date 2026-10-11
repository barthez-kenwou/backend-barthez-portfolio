import type { Request, Response } from 'express';

import { SYSTEM_ROLES } from '@/shared/constants/app.constants';
import { asyncHandler, response } from '@/shared/utils/http/responses/helpers';

import type { CreatePartnerCommand } from '../../application/commands/create-partner.command';
import type { DeletePartnerCommand } from '../../application/commands/delete-partner.command';
import type { UpdatePartnerCommand } from '../../application/commands/update-partner.command';
import type { GetPartnerQuery } from '../../application/queries/get-partner.query';
import type { ListPartnersQuery } from '../../application/queries/list-partners.query';
import type { PartnerRbacPort } from '../../application/services/rbac.port';
import { PartnerSerializer } from '../serializers/partner.serializer';

type AuthenticatedRequest = Request & {
  user?: { id: string };
};

export type PartnerControllerDeps = {
  createPartner: CreatePartnerCommand;
  updatePartner: UpdatePartnerCommand;
  deletePartner: DeletePartnerCommand;
  getPartner: GetPartnerQuery;
  listPartners: ListPartnersQuery;
  rbac: PartnerRbacPort;
};

export function createPartnerController(deps: PartnerControllerDeps) {
  const isAdmin = async (userId: string): Promise<boolean> =>
    deps.rbac.hasAnyRole(userId, [SYSTEM_ROLES.ADMIN, SYSTEM_ROLES.SUPER_ADMIN]);

  const parseBool = (value: unknown): boolean | undefined => {
    if (value === undefined || value === null || value === '') return undefined;
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return undefined;
  };

  const list = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await deps.listPartners.execute({
      page,
      limit,
      isPublished: parseBool(req.query.isPublished),
      includeUnpublished: parseBool(req.query.includeUnpublished) === true,
    });
    return response.ok(req, res, PartnerSerializer.list(result), 'Partners retrieved');
  });

  const getById = asyncHandler(async (req: Request, res: Response) => {
    const item = await deps.getPartner.execute({ id: req.params.partnerId });
    return response.ok(req, res, PartnerSerializer.one(item), 'Partner retrieved');
  });

  const create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const item = await deps.createPartner.execute({
      name: req.body.name,
      logoUrl: req.body.logoUrl,
      websiteUrl: req.body.websiteUrl,
      descriptionFr: req.body.descriptionFr,
      descriptionEn: req.body.descriptionEn,
      relationFr: req.body.relationFr,
      relationEn: req.body.relationEn,
      sortOrder: req.body.sortOrder,
      isPublished: req.body.isPublished,
      ownerId: req.user!.id,
    });
    return response.created(req, res, PartnerSerializer.one(item), 'Partner created');
  });

  const update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const admin = await isAdmin(req.user!.id);
    const item = await deps.updatePartner.execute({
      id: req.params.partnerId,
      actorId: req.user!.id,
      isAdmin: admin,
      name: req.body.name,
      logoUrl: req.body.logoUrl,
      websiteUrl: req.body.websiteUrl,
      descriptionFr: req.body.descriptionFr,
      descriptionEn: req.body.descriptionEn,
      relationFr: req.body.relationFr,
      relationEn: req.body.relationEn,
      sortOrder: req.body.sortOrder,
      isPublished: req.body.isPublished,
    });
    return response.ok(req, res, PartnerSerializer.one(item), 'Partner updated');
  });

  const remove = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const admin = await isAdmin(req.user!.id);
    await deps.deletePartner.execute({
      id: req.params.partnerId,
      actorId: req.user!.id,
      isAdmin: admin,
    });
    return response.ok(req, res, null, 'Partner deleted');
  });

  return { list, getById, create, update, remove };
}

export type PartnerController = ReturnType<typeof createPartnerController>;
