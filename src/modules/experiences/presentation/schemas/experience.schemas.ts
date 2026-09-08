/**
 * Experience express-validator rules (presentation layer).
 */
import { body, param, query } from 'express-validator';

const experienceIdParam = param('experienceId')
  .trim()
  .notEmpty()
  .withMessage('Experience ID is required')
  .isMongoId()
  .withMessage('Experience ID must be a valid Mongo ObjectId');

export const experienceSchemas = {
  list: [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('limit must be between 1 and 100'),
  ],

  byId: [experienceIdParam],

  create: [
    body('titleFr')
      .trim()
      .notEmpty()
      .withMessage('titleFr is required')
      .isLength({ min: 1, max: 200 })
      .withMessage('titleFr must be between 1 and 200 characters'),
    body('titleEn')
      .trim()
      .notEmpty()
      .withMessage('titleEn is required')
      .isLength({ min: 1, max: 200 })
      .withMessage('titleEn must be between 1 and 200 characters'),
    body('companyFr')
      .trim()
      .notEmpty()
      .withMessage('companyFr is required')
      .isLength({ min: 1, max: 200 })
      .withMessage('companyFr must be between 1 and 200 characters'),
    body('companyEn')
      .trim()
      .notEmpty()
      .withMessage('companyEn is required')
      .isLength({ min: 1, max: 200 })
      .withMessage('companyEn must be between 1 and 200 characters'),
    body('period')
      .trim()
      .notEmpty()
      .withMessage('period is required')
      .isLength({ min: 1, max: 120 })
      .withMessage('period must be between 1 and 120 characters'),
    body('descriptionFr')
      .isArray({ min: 0 })
      .withMessage('descriptionFr must be an array of strings'),
    body('descriptionFr.*')
      .isString()
      .withMessage('each descriptionFr item must be a string')
      .trim()
      .isLength({ max: 1000 })
      .withMessage('each descriptionFr item must be at most 1000 characters'),
    body('descriptionEn')
      .isArray({ min: 0 })
      .withMessage('descriptionEn must be an array of strings'),
    body('descriptionEn.*')
      .isString()
      .withMessage('each descriptionEn item must be a string')
      .trim()
      .isLength({ max: 1000 })
      .withMessage('each descriptionEn item must be at most 1000 characters'),
    body('sortOrder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('sortOrder must be an integer >= 0')
      .toInt(),
  ],

  update: [
    experienceIdParam,
    body('titleFr')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('titleFr must be between 1 and 200 characters'),
    body('titleEn')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('titleEn must be between 1 and 200 characters'),
    body('companyFr')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('companyFr must be between 1 and 200 characters'),
    body('companyEn')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('companyEn must be between 1 and 200 characters'),
    body('period')
      .optional()
      .trim()
      .isLength({ min: 1, max: 120 })
      .withMessage('period must be between 1 and 120 characters'),
    body('descriptionFr')
      .optional()
      .isArray({ min: 0 })
      .withMessage('descriptionFr must be an array of strings'),
    body('descriptionFr.*')
      .optional()
      .isString()
      .withMessage('each descriptionFr item must be a string')
      .trim()
      .isLength({ max: 1000 })
      .withMessage('each descriptionFr item must be at most 1000 characters'),
    body('descriptionEn')
      .optional()
      .isArray({ min: 0 })
      .withMessage('descriptionEn must be an array of strings'),
    body('descriptionEn.*')
      .optional()
      .isString()
      .withMessage('each descriptionEn item must be a string')
      .trim()
      .isLength({ max: 1000 })
      .withMessage('each descriptionEn item must be at most 1000 characters'),
    body('sortOrder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('sortOrder must be an integer >= 0')
      .toInt(),
  ],
};
