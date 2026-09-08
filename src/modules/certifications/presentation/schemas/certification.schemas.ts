/**
 * Certification express-validator rules (presentation layer).
 */
import { body, param, query } from 'express-validator';

const certificationIdParam = param('certificationId')
  .trim()
  .notEmpty()
  .withMessage('Certification ID is required')
  .isMongoId()
  .withMessage('Certification ID must be a valid Mongo ObjectId');

export const certificationSchemas = {
  list: [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('limit must be between 1 and 100'),
  ],

  byId: [certificationIdParam],

  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('name is required')
      .isLength({ min: 1, max: 200 })
      .withMessage('name must be between 1 and 200 characters'),
    body('issuer')
      .trim()
      .notEmpty()
      .withMessage('issuer is required')
      .isLength({ min: 1, max: 200 })
      .withMessage('issuer must be between 1 and 200 characters'),
    body('year')
      .trim()
      .notEmpty()
      .withMessage('year is required')
      .isLength({ min: 1, max: 20 })
      .withMessage('year must be between 1 and 20 characters'),
    body('link')
      .optional({ nullable: true })
      .trim()
      .isLength({ max: 2048 })
      .withMessage('link must be at most 2048 characters'),
    body('sortOrder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('sortOrder must be an integer >= 0')
      .toInt(),
  ],

  update: [
    certificationIdParam,
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('name must be between 1 and 200 characters'),
    body('issuer')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('issuer must be between 1 and 200 characters'),
    body('year')
      .optional()
      .trim()
      .isLength({ min: 1, max: 20 })
      .withMessage('year must be between 1 and 20 characters'),
    body('link')
      .optional({ nullable: true })
      .trim()
      .isLength({ max: 2048 })
      .withMessage('link must be at most 2048 characters'),
    body('sortOrder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('sortOrder must be an integer >= 0')
      .toInt(),
  ],
};
