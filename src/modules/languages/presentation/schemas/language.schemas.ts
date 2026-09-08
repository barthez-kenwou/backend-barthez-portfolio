/**
 * Language express-validator rules (presentation layer).
 */
import { body, param, query } from 'express-validator';

const languageIdParam = param('languageId')
  .trim()
  .notEmpty()
  .withMessage('Language ID is required')
  .isMongoId()
  .withMessage('Language ID must be a valid Mongo ObjectId');

export const languageSchemas = {
  list: [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('limit must be between 1 and 100'),
  ],

  byId: [languageIdParam],

  create: [
    body('language')
      .trim()
      .notEmpty()
      .withMessage('language is required')
      .isLength({ min: 1, max: 80 })
      .withMessage('language must be between 1 and 80 characters'),
    body('proficiencyFr')
      .trim()
      .notEmpty()
      .withMessage('proficiencyFr is required')
      .isLength({ min: 1, max: 120 })
      .withMessage('proficiencyFr must be between 1 and 120 characters'),
    body('proficiencyEn')
      .trim()
      .notEmpty()
      .withMessage('proficiencyEn is required')
      .isLength({ min: 1, max: 120 })
      .withMessage('proficiencyEn must be between 1 and 120 characters'),
    body('sortOrder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('sortOrder must be an integer >= 0')
      .toInt(),
  ],

  update: [
    languageIdParam,
    body('language')
      .optional()
      .trim()
      .isLength({ min: 1, max: 80 })
      .withMessage('language must be between 1 and 80 characters'),
    body('proficiencyFr')
      .optional()
      .trim()
      .isLength({ min: 1, max: 120 })
      .withMessage('proficiencyFr must be between 1 and 120 characters'),
    body('proficiencyEn')
      .optional()
      .trim()
      .isLength({ min: 1, max: 120 })
      .withMessage('proficiencyEn must be between 1 and 120 characters'),
    body('sortOrder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('sortOrder must be an integer >= 0')
      .toInt(),
  ],
};
