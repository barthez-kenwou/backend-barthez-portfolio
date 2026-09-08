import type { Request, Response } from 'express';

import { asyncHandler, response } from '@/shared/utils/http/responses/helpers';

import type { GetCvQuery } from '../../application/queries/get-cv.query';
import { CvSerializer } from '../serializers/cv.serializer';

export type CvControllerDeps = {
  getCv: GetCvQuery;
};

/**
 * Thin Express handlers for the public CV aggregate.
 */
export function createCvController(deps: CvControllerDeps) {
  const get = asyncHandler(async (req: Request, res: Response) => {
    const cv = await deps.getCv.execute();
    return response.ok(req, res, CvSerializer.one(cv), 'CV retrieved successfully');
  });

  return { get };
}

export type CvController = ReturnType<typeof createCvController>;
