/**
 * Contact Info express-validator rules.
 */
import { body, query } from 'express-validator';

const requiredStr = (field: string, max: number) =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage(`${field} is required`)
    .isLength({ max })
    .withMessage(`${field} must be at most ${max} characters`);

export const contactInfoSchemas = {
  get: [
    query('key')
      .optional()
      .trim()
      .isLength({ min: 1, max: 64 })
      .withMessage('key must be 1-64 characters'),
  ],

  upsert: [
    body('singletonKey').optional().trim().isLength({ min: 1, max: 64 }),
    requiredStr('name', 200),
    requiredStr('handle', 100),
    requiredStr('titleFr', 300),
    requiredStr('titleEn', 300),
    requiredStr('subtitleFr', 500),
    requiredStr('subtitleEn', 500),
    body('email').trim().notEmpty().isEmail().withMessage('email must be valid'),
    requiredStr('phone', 50),
    requiredStr('whatsappLink', 500),
    requiredStr('location', 200),
    requiredStr('website', 500),
    requiredStr('repository', 500),
    requiredStr('github', 500),
    requiredStr('linkedin', 500),
    requiredStr('facebook', 500),
    body('photoUrl').optional({ nullable: true }).trim().isLength({ max: 1000 }),
    body('yearsExperience').optional({ nullable: true }).isInt({ min: 0, max: 80 }),
    body('tags').optional().isArray(),
    body('tags.*').optional().trim().isLength({ max: 100 }),
  ],

  remove: [
    query('key')
      .optional()
      .trim()
      .isLength({ min: 1, max: 64 })
      .withMessage('key must be 1-64 characters'),
  ],
};
