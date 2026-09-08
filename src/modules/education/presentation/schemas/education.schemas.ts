/**
 * Education express-validator rules (presentation layer).
 */
import { body, param, query } from 'express-validator';

const educationIdParam = param('educationId')
  .trim()
  .notEmpty()
  .withMessage('Education ID is required')
  .isMongoId()
  .withMessage('Education ID must be a valid Mongo ObjectId');

export const educationSchemas = {
  list: [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('limit must be between 1 and 100'),
  ],

  byId: [educationIdParam],

  create: [
    body('degreeFr')
      .trim()
      .notEmpty()
      .withMessage('degreeFr is required')
      .isLength({ min: 1, max: 200 })
      .withMessage('degreeFr must be between 1 and 200 characters'),
    body('degreeEn')
      .trim()
      .notEmpty()
      .withMessage('degreeEn is required')
      .isLength({ min: 1, max: 200 })
      .withMessage('degreeEn must be between 1 and 200 characters'),
    body('school')
      .trim()
      .notEmpty()
      .withMessage('school is required')
      .isLength({ min: 1, max: 200 })
      .withMessage('school must be between 1 and 200 characters'),
    body('period')
      .trim()
      .notEmpty()
      .withMessage('period is required')
      .isLength({ min: 1, max: 120 })
      .withMessage('period must be between 1 and 120 characters'),
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
    educationIdParam,
    body('degreeFr')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('degreeFr must be between 1 and 200 characters'),
    body('degreeEn')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('degreeEn must be between 1 and 200 characters'),
    body('school')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('school must be between 1 and 200 characters'),
    body('period')
      .optional()
      .trim()
      .isLength({ min: 1, max: 120 })
      .withMessage('period must be between 1 and 120 characters'),
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
