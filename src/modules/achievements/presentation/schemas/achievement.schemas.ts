/**
 * Achievement express-validator rules (presentation layer).
 */
import { body, param, query } from 'express-validator';

const achievementIdParam = param('achievementId')
  .trim()
  .notEmpty()
  .withMessage('Achievement ID is required')
  .isMongoId()
  .withMessage('Achievement ID must be a valid Mongo ObjectId');

export const achievementSchemas = {
  list: [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('limit must be between 1 and 100'),
  ],

  byId: [achievementIdParam],

  create: [
    body('iconKey')
      .trim()
      .notEmpty()
      .withMessage('iconKey is required')
      .isLength({ min: 1, max: 80 })
      .withMessage('iconKey must be between 1 and 80 characters'),
    body('value')
      .trim()
      .notEmpty()
      .withMessage('value is required')
      .isLength({ min: 1, max: 40 })
      .withMessage('value must be between 1 and 40 characters'),
    body('labelFr')
      .trim()
      .notEmpty()
      .withMessage('labelFr is required')
      .isLength({ min: 1, max: 120 })
      .withMessage('labelFr must be between 1 and 120 characters'),
    body('labelEn')
      .trim()
      .notEmpty()
      .withMessage('labelEn is required')
      .isLength({ min: 1, max: 120 })
      .withMessage('labelEn must be between 1 and 120 characters'),
    body('sortOrder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('sortOrder must be an integer >= 0')
      .toInt(),
  ],

  update: [
    achievementIdParam,
    body('iconKey')
      .optional()
      .trim()
      .isLength({ min: 1, max: 80 })
      .withMessage('iconKey must be between 1 and 80 characters'),
    body('value')
      .optional()
      .trim()
      .isLength({ min: 1, max: 40 })
      .withMessage('value must be between 1 and 40 characters'),
    body('labelFr')
      .optional()
      .trim()
      .isLength({ min: 1, max: 120 })
      .withMessage('labelFr must be between 1 and 120 characters'),
    body('labelEn')
      .optional()
      .trim()
      .isLength({ min: 1, max: 120 })
      .withMessage('labelEn must be between 1 and 120 characters'),
    body('sortOrder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('sortOrder must be an integer >= 0')
      .toInt(),
  ],
};
