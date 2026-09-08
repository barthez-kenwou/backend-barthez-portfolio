/**
 * Skill express-validator rules (presentation layer).
 */
import { body, param, query } from 'express-validator';

const skillIdParam = param('skillId')
  .trim()
  .notEmpty()
  .withMessage('Skill ID is required')
  .isMongoId()
  .withMessage('Skill ID must be a valid Mongo ObjectId');

export const skillSchemas = {
  list: [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('limit must be between 1 and 100'),
  ],

  byId: [skillIdParam],

  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('name is required')
      .isLength({ min: 1, max: 120 })
      .withMessage('name must be between 1 and 120 characters'),
    body('category')
      .trim()
      .notEmpty()
      .withMessage('category is required')
      .isLength({ min: 1, max: 80 })
      .withMessage('category must be between 1 and 80 characters'),
    body('level')
      .isInt({ min: 0, max: 100 })
      .withMessage('level must be an integer between 0 and 100')
      .toInt(),
    body('icon')
      .trim()
      .notEmpty()
      .withMessage('icon is required')
      .isLength({ min: 1, max: 2048 })
      .withMessage('icon must be between 1 and 2048 characters'),
    body('sortOrder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('sortOrder must be an integer >= 0')
      .toInt(),
  ],

  update: [
    skillIdParam,
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 120 })
      .withMessage('name must be between 1 and 120 characters'),
    body('category')
      .optional()
      .trim()
      .isLength({ min: 1, max: 80 })
      .withMessage('category must be between 1 and 80 characters'),
    body('level')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('level must be an integer between 0 and 100')
      .toInt(),
    body('icon')
      .optional()
      .trim()
      .isLength({ min: 1, max: 2048 })
      .withMessage('icon must be between 1 and 2048 characters'),
    body('sortOrder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('sortOrder must be an integer >= 0')
      .toInt(),
  ],
};
