import type { Router } from 'express';

import { type AuditPort, auditRepository } from '@/shared/infrastructure/audit';

import { CreateServiceCommand } from './application/commands/create-service.command';
import { DeleteServiceCommand } from './application/commands/delete-service.command';
import { UpdateServiceCommand } from './application/commands/update-service.command';
import { GetServiceQuery } from './application/queries/get-service.query';
import { ListServicesQuery } from './application/queries/list-services.query';
import type { ServiceRbacPort } from './application/services/rbac.port';
import type { ServiceRepositoryPort } from './domain/repositories/service.repository';
import { createServiceRbacAdapter } from './infrastructure/providers/legacy-adapters';
import { PrismaServiceRepository } from './infrastructure/repositories/prisma-service.repository';
import {
  type ServiceController,
  createServiceController,
} from './presentation/controllers/service.controller';
import { createServiceRoutes } from './presentation/routes/service.routes';

/**
 * Explicit dependencies for the Service module.
 */
export type ServiceModuleDeps = {
  serviceRepository: ServiceRepositoryPort;
  rbac: ServiceRbacPort;
  audit?: AuditPort;
};

export type ServiceModule = {
  deps: ServiceModuleDeps;
  useCases: {
    createService: CreateServiceCommand;
    updateService: UpdateServiceCommand;
    deleteService: DeleteServiceCommand;
    getService: GetServiceQuery;
    listServices: ListServicesQuery;
  };
  controller: ServiceController;
  router: Router;
};

/**
 * Builds default infrastructure adapters.
 * Override any key when wiring a test double or alternate provider.
 */
export function createDefaultServiceDeps(
  overrides: Partial<ServiceModuleDeps> = {},
): ServiceModuleDeps {
  return {
    serviceRepository: overrides.serviceRepository ?? new PrismaServiceRepository(),
    rbac: overrides.rbac ?? createServiceRbacAdapter(),
    audit: overrides.audit ?? auditRepository,
  };
}

/**
 * Composition root for the Service bounded context.
 */
export function createServiceModule(deps: ServiceModuleDeps): ServiceModule {
  const useCases = {
    createService: new CreateServiceCommand(deps),
    updateService: new UpdateServiceCommand(deps),
    deleteService: new DeleteServiceCommand(deps),
    getService: new GetServiceQuery(deps),
    listServices: new ListServicesQuery(deps),
  };

  const controller = createServiceController({
    ...useCases,
    rbac: deps.rbac,
  });

  const router = createServiceRoutes(controller);

  return { deps, useCases, controller, router };
}

/** Convenience: fully wired Express router for route registration. */
export function createServiceRouter(overrides: Partial<ServiceModuleDeps> = {}): Router {
  return createServiceModule(createDefaultServiceDeps(overrides)).router;
}

export type { ServiceEntity } from './domain/entities/service.entity';
export { PrismaServiceRepository } from './infrastructure/repositories/prisma-service.repository';
export { serviceSchemas } from './presentation/schemas/service.schemas';
export { ServiceSerializer } from './presentation/serializers/service.serializer';
