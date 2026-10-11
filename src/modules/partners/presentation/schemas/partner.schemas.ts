/**
 * Partner express-validator rules (presentation layer).
 */
import { body, param, query } from 'express-validator';

const partnerIdParam = param('partnerId')
  .trim()
  .notEmpty()
  .withMessage('Partner ID is required')
  .isMongoId()
  .withMessage('Partner ID must be a valid Mongo ObjectId');

const optionalUrl = (field: string) =>
  body(field)
    .optional({ values: 'null' })
    .custom((value) => {
      if (value === null || value === undefined || value === '') return true;
      try {
        new URL(String(value));
        return true;
      } catch {
        throw new Error(`${field} must be a valid URL`);
      }
    });

export const partnerSchemas = {
  list: [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('limit must be between 1 and 100'),
    query('isPublished').optional().isBoolean().withMessage('isPublished must be a boolean'),
    query('includeUnpublished')
      .optional()
      .isBoolean()
      .withMessage('includeUnpublished must be a boolean'),
  ],

  byId: [partnerIdParam],

  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('name is required')
      .isLength({ min: 1, max: 160 })
      .withMessage('name must be between 1 and 160 characters'),
    body('logoUrl')
      .trim()
      .notEmpty()
      .withMessage('logoUrl is required')
      .isLength({ min: 1, max: 2048 })
      .withMessage('logoUrl must be between 1 and 2048 characters'),
    optionalUrl('websiteUrl'),
    body('descriptionFr')
      .optional({ values: 'null' })
      .trim()
      .isLength({ max: 500 })
      .withMessage('descriptionFr must be at most 500 characters'),
    body('descriptionEn')
      .optional({ values: 'null' })
      .trim()
      .isLength({ max: 500 })
      .withMessage('descriptionEn must be at most 500 characters'),
    body('relationFr')
      .optional({ values: 'null' })
      .trim()
      .isLength({ max: 120 })
      .withMessage('relationFr must be at most 120 characters'),
    body('relationEn')
      .optional({ values: 'null' })
      .trim()
      .isLength({ max: 120 })
      .withMessage('relationEn must be at most 120 characters'),
    body('sortOrder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('sortOrder must be an integer >= 0')
      .toInt(),
    body('isPublished').optional().isBoolean().withMessage('isPublished must be a boolean'),
  ],

  update: [
    partnerIdParam,
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 160 })
      .withMessage('name must be between 1 and 160 characters'),
    body('logoUrl')
      .optional()
      .trim()
      .isLength({ min: 1, max: 2048 })
      .withMessage('logoUrl must be between 1 and 2048 characters'),
    optionalUrl('websiteUrl'),
    body('descriptionFr')
      .optional({ values: 'null' })
      .trim()
      .isLength({ max: 500 })
      .withMessage('descriptionFr must be at most 500 characters'),
    body('descriptionEn')
      .optional({ values: 'null' })
      .trim()
      .isLength({ max: 500 })
      .withMessage('descriptionEn must be at most 500 characters'),
    body('relationFr')
      .optional({ values: 'null' })
      .trim()
      .isLength({ max: 120 })
      .withMessage('relationFr must be at most 120 characters'),
    body('relationEn')
      .optional({ values: 'null' })
      .trim()
      .isLength({ max: 120 })
      .withMessage('relationEn must be at most 120 characters'),
    body('sortOrder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('sortOrder must be an integer >= 0')
      .toInt(),
    body('isPublished').optional().isBoolean().withMessage('isPublished must be a boolean'),
  ],
};
