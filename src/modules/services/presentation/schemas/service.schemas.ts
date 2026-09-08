/**
 * Service express-validator rules (presentation layer).
 */
import { body, param, query } from 'express-validator';

const serviceIdParam = param('serviceId')
  .trim()
  .notEmpty()
  .withMessage('Service ID is required')
  .isMongoId()
  .withMessage('Service ID must be a valid Mongo ObjectId');

export const serviceSchemas = {
  list: [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('limit must be between 1 and 100'),
  ],

  byId: [serviceIdParam],

  create: [
    body('iconKey')
      .trim()
      .notEmpty()
      .withMessage('iconKey is required')
      .isLength({ min: 1, max: 80 })
      .withMessage('iconKey must be between 1 and 80 characters'),
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
    body('descFr')
      .trim()
      .notEmpty()
      .withMessage('descFr is required')
      .isLength({ min: 1, max: 5000 })
      .withMessage('descFr must be between 1 and 5000 characters'),
    body('descEn')
      .trim()
      .notEmpty()
      .withMessage('descEn is required')
      .isLength({ min: 1, max: 5000 })
      .withMessage('descEn must be between 1 and 5000 characters'),
    body('featuresFr').isArray({ min: 0 }).withMessage('featuresFr must be an array of strings'),
    body('featuresFr.*')
      .isString()
      .withMessage('each featuresFr item must be a string')
      .trim()
      .isLength({ max: 1000 })
      .withMessage('each featuresFr item must be at most 1000 characters'),
    body('featuresEn').isArray({ min: 0 }).withMessage('featuresEn must be an array of strings'),
    body('featuresEn.*')
      .isString()
      .withMessage('each featuresEn item must be a string')
      .trim()
      .isLength({ max: 1000 })
      .withMessage('each featuresEn item must be at most 1000 characters'),
    body('priceEur').isFloat({ min: 0 }).withMessage('priceEur must be a number >= 0').toFloat(),
    body('hourly').optional().isBoolean().withMessage('hourly must be a boolean').toBoolean(),
    body('priceFr')
      .trim()
      .notEmpty()
      .withMessage('priceFr is required')
      .isLength({ min: 1, max: 80 })
      .withMessage('priceFr must be between 1 and 80 characters'),
    body('priceEn')
      .trim()
      .notEmpty()
      .withMessage('priceEn is required')
      .isLength({ min: 1, max: 80 })
      .withMessage('priceEn must be between 1 and 80 characters'),
    body('sortOrder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('sortOrder must be an integer >= 0')
      .toInt(),
    body('isPublished')
      .optional()
      .isBoolean()
      .withMessage('isPublished must be a boolean')
      .toBoolean(),
  ],

  update: [
    serviceIdParam,
    body('iconKey')
      .optional()
      .trim()
      .isLength({ min: 1, max: 80 })
      .withMessage('iconKey must be between 1 and 80 characters'),
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
    body('descFr')
      .optional()
      .trim()
      .isLength({ min: 1, max: 5000 })
      .withMessage('descFr must be between 1 and 5000 characters'),
    body('descEn')
      .optional()
      .trim()
      .isLength({ min: 1, max: 5000 })
      .withMessage('descEn must be between 1 and 5000 characters'),
    body('featuresFr')
      .optional()
      .isArray({ min: 0 })
      .withMessage('featuresFr must be an array of strings'),
    body('featuresFr.*')
      .optional()
      .isString()
      .withMessage('each featuresFr item must be a string')
      .trim()
      .isLength({ max: 1000 })
      .withMessage('each featuresFr item must be at most 1000 characters'),
    body('featuresEn')
      .optional()
      .isArray({ min: 0 })
      .withMessage('featuresEn must be an array of strings'),
    body('featuresEn.*')
      .optional()
      .isString()
      .withMessage('each featuresEn item must be a string')
      .trim()
      .isLength({ max: 1000 })
      .withMessage('each featuresEn item must be at most 1000 characters'),
    body('priceEur')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('priceEur must be a number >= 0')
      .toFloat(),
    body('hourly').optional().isBoolean().withMessage('hourly must be a boolean').toBoolean(),
    body('priceFr')
      .optional()
      .trim()
      .isLength({ min: 1, max: 80 })
      .withMessage('priceFr must be between 1 and 80 characters'),
    body('priceEn')
      .optional()
      .trim()
      .isLength({ min: 1, max: 80 })
      .withMessage('priceEn must be between 1 and 80 characters'),
    body('sortOrder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('sortOrder must be an integer >= 0')
      .toInt(),
    body('isPublished')
      .optional()
      .isBoolean()
      .withMessage('isPublished must be a boolean')
      .toBoolean(),
  ],
};
