import { Router } from 'express';

import type { CvController } from '../controllers/cv.controller';

/**
 * CV HTTP routes — mounted at `/api/v1/cv`.
 * Public read-only aggregate of profile data.
 */
export function createCvRoutes(controller: CvController): Router {
  const cv = Router();

  /** GET / — Full public CV aggregate. */
  cv.get('/', controller.get);

  return cv;
}
