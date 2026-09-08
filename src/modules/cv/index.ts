import type { Router } from 'express';

import { GetCvQuery } from './application/queries/get-cv.query';
import { type CvController, createCvController } from './presentation/controllers/cv.controller';
import { createCvRoutes } from './presentation/routes/cv.routes';

/**
 * Explicit dependencies for the CV module (thin Prisma-backed aggregate).
 */
export type CvModuleDeps = {
  getCv?: GetCvQuery;
};

export type CvModule = {
  deps: Required<CvModuleDeps>;
  useCases: {
    getCv: GetCvQuery;
  };
  controller: CvController;
  router: Router;
};

/**
 * Builds default infrastructure for the CV module.
 */
export function createDefaultCvDeps(overrides: Partial<CvModuleDeps> = {}): Required<CvModuleDeps> {
  return {
    getCv: overrides.getCv ?? new GetCvQuery(),
  };
}

/**
 * Composition root for the CV aggregate.
 */
export function createCvModule(deps: Required<CvModuleDeps>): CvModule {
  const useCases = {
    getCv: deps.getCv,
  };

  const controller = createCvController(useCases);
  const router = createCvRoutes(controller);

  return { deps, useCases, controller, router };
}

/** Convenience: fully wired CV Express router for route registration. */
export function createCvRouter(overrides: Partial<CvModuleDeps> = {}): Router {
  return createCvModule(createDefaultCvDeps(overrides)).router;
}

export type { CvAggregate } from './application/queries/get-cv.query';
export { GetCvQuery } from './application/queries/get-cv.query';
export { CvSerializer } from './presentation/serializers/cv.serializer';
