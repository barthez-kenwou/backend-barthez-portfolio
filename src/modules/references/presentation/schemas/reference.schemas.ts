/**
 * Reference express-validator rules (presentation layer).
 */
import { body, param, query } from 'express-validator';

const referenceIdParam = param('referenceId')
  .trim()
  .notEmpty()
  .withMessage('Reference ID is required')
  .isMongoId()
  .withMessage('Reference ID must be a valid Mongo ObjectId');

export const referenceSchemas = {
  list: [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('limit must be between 1 and 100'),
  ],

  byId: [referenceIdParam],

  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('name is required')
      .isLength({ min: 1, max: 120 })
      .withMessage('name must be between 1 and 120 characters'),
    body('roleFr')
      .trim()
      .notEmpty()
      .withMessage('roleFr is required')
      .isLength({ min: 1, max: 120 })
      .withMessage('roleFr must be between 1 and 120 characters'),
    body('roleEn')
      .trim()
      .notEmpty()
      .withMessage('roleEn is required')
      .isLength({ min: 1, max: 120 })
      .withMessage('roleEn must be between 1 and 120 characters'),
    body('company')
      .trim()
      .notEmpty()
      .withMessage('company is required')
      .isLength({ min: 1, max: 200 })
      .withMessage('company must be between 1 and 200 characters'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('email is required')
      .isEmail()
      .withMessage('email must be a valid email')
      .isLength({ min: 1, max: 254 })
      .withMessage('email must be between 1 and 254 characters'),
    body('phone')
      .trim()
      .notEmpty()
      .withMessage('phone is required')
      .isLength({ min: 1, max: 40 })
      .withMessage('phone must be between 1 and 40 characters'),
    body('sortOrder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('sortOrder must be an integer >= 0')
      .toInt(),
  ],

  update: [
    referenceIdParam,
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 120 })
      .withMessage('name must be between 1 and 120 characters'),
    body('roleFr')
      .optional()
      .trim()
      .isLength({ min: 1, max: 120 })
      .withMessage('roleFr must be between 1 and 120 characters'),
    body('roleEn')
      .optional()
      .trim()
      .isLength({ min: 1, max: 120 })
      .withMessage('roleEn must be between 1 and 120 characters'),
    body('company')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('company must be between 1 and 200 characters'),
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('email must be a valid email')
      .isLength({ max: 254 })
      .withMessage('email must be at most 254 characters'),
    body('phone')
      .optional()
      .trim()
      .isLength({ min: 1, max: 40 })
      .withMessage('phone must be between 1 and 40 characters'),
    body('sortOrder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('sortOrder must be an integer >= 0')
      .toInt(),
  ],
};
