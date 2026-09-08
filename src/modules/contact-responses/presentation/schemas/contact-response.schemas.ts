/**
 * Contact Response express-validator rules.
 */
import { body, param, query } from 'express-validator';

const contactResponseIdParam = param('contactResponseId')
  .trim()
  .notEmpty()
  .withMessage('Contact Response ID is required')
  .isMongoId()
  .withMessage('Contact Response ID must be a valid Mongo ObjectId');

const statuses = ['new', 'read', 'archived', 'replied'] as const;

export const contactResponseSchemas = {
  list: [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status')
      .optional()
      .isIn([...statuses]),
  ],

  byId: [contactResponseIdParam],

  submit: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('name is required')
      .isLength({ max: 200 })
      .withMessage('name must be at most 200 characters'),
    body('email').trim().notEmpty().isEmail().withMessage('email must be valid'),
    body('subject')
      .trim()
      .notEmpty()
      .withMessage('subject is required')
      .isLength({ max: 300 })
      .withMessage('subject must be at most 300 characters'),
    body('message')
      .trim()
      .notEmpty()
      .withMessage('message is required')
      .isLength({ max: 10000 })
      .withMessage('message must be at most 10000 characters'),
  ],

  update: [
    contactResponseIdParam,
    body('name').optional().trim().isLength({ min: 1, max: 200 }),
    body('email').optional().trim().isEmail().withMessage('email must be valid'),
    body('subject').optional().trim().isLength({ min: 1, max: 300 }),
    body('message').optional().trim().isLength({ min: 1, max: 10000 }),
    body('status')
      .optional()
      .isIn([...statuses]),
    body('notes').optional({ nullable: true }).trim().isLength({ max: 5000 }),
  ],
};
