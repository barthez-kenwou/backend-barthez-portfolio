import type { Request, Response } from 'express';

import { SYSTEM_ROLES } from '@/shared/constants/app.constants';
import { asyncHandler, response } from '@/shared/utils/http/responses/helpers';

import type { CreateServiceCommand } from '../../application/commands/create-service.command';
import type { DeleteServiceCommand } from '../../application/commands/delete-service.command';
import type { UpdateServiceCommand } from '../../application/commands/update-service.command';
import type { GetServiceQuery } from '../../application/queries/get-service.query';
import type { ListServicesQuery } from '../../application/queries/list-services.query';
import type { ServiceRbacPort } from '../../application/services/rbac.port';
import { ServiceSerializer } from '../serializers/service.serializer';

type AuthenticatedRequest = Request & {
  user?: { id: string };
};

export type ServiceControllerDeps = {
  createService: CreateServiceCommand;
  updateService: UpdateServiceCommand;
  deleteService: DeleteServiceCommand;
  getService: GetServiceQuery;
  listServices: ListServicesQuery;
  rbac: ServiceRbacPort;
};

/**
 * Thin Express handlers — HTTP concerns only; business rules live in commands/queries.
 */
export function createServiceController(deps: ServiceControllerDeps) {
  const isAdmin = async (userId: string): Promise<boolean> =>
    deps.rbac.hasAnyRole(userId, [SYSTEM_ROLES.ADMIN, SYSTEM_ROLES.SUPER_ADMIN]);

  const list = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await deps.listServices.execute({ page, limit });
    return response.ok(req, res, ServiceSerializer.list(result), 'Services retrieved');
  });

  const getById = asyncHandler(async (req: Request, res: Response) => {
    const item = await deps.getService.execute({ id: req.params.serviceId });
    return response.ok(req, res, ServiceSerializer.one(item), 'Service retrieved');
  });

  const create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const item = await deps.createService.execute({
      iconKey: req.body.iconKey,
      titleFr: req.body.titleFr,
      titleEn: req.body.titleEn,
      descFr: req.body.descFr,
      descEn: req.body.descEn,
      featuresFr: req.body.featuresFr,
      featuresEn: req.body.featuresEn,
      priceEur: req.body.priceEur,
      hourly: req.body.hourly,
      priceFr: req.body.priceFr,
      priceEn: req.body.priceEn,
      sortOrder: req.body.sortOrder,
      isPublished: req.body.isPublished,
      ownerId: req.user!.id,
    });
    return response.created(req, res, ServiceSerializer.one(item), 'Service created');
  });

  const update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const admin = await isAdmin(req.user!.id);
    const item = await deps.updateService.execute({
      id: req.params.serviceId,
      actorId: req.user!.id,
      isAdmin: admin,
      iconKey: req.body.iconKey,
      titleFr: req.body.titleFr,
      titleEn: req.body.titleEn,
      descFr: req.body.descFr,
      descEn: req.body.descEn,
      featuresFr: req.body.featuresFr,
      featuresEn: req.body.featuresEn,
      priceEur: req.body.priceEur,
      hourly: req.body.hourly,
      priceFr: req.body.priceFr,
      priceEn: req.body.priceEn,
      sortOrder: req.body.sortOrder,
      isPublished: req.body.isPublished,
    });
    return response.ok(req, res, ServiceSerializer.one(item), 'Service updated');
  });

  const remove = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const admin = await isAdmin(req.user!.id);
    await deps.deleteService.execute({
      id: req.params.serviceId,
      actorId: req.user!.id,
      isAdmin: admin,
    });
    return response.ok(req, res, null, 'Service deleted');
  });

  return { list, getById, create, update, remove };
}

export type ServiceController = ReturnType<typeof createServiceController>;
