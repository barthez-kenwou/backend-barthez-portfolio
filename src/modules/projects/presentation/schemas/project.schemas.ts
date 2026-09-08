/**
 * Project express-validator rules (presentation layer).
 */
import { body, param, query } from 'express-validator';

const projectIdParam = param('projectId')
  .trim()
  .notEmpty()
  .withMessage('Project ID is required')
  .isMongoId()
  .withMessage('Project ID must be a valid Mongo ObjectId');

const optionalStringArray = (field: string) =>
  body(field)
    .optional()
    .isArray()
    .withMessage(`${field} must be an array`)
    .bail()
    .custom((arr: unknown[]) => arr.every((v) => typeof v === 'string'))
    .withMessage(`${field} must be an array of strings`);

const requiredStringArray = (field: string) =>
  body(field)
    .isArray({ min: 1 })
    .withMessage(`${field} must be a non-empty array`)
    .bail()
    .custom((arr: unknown[]) => arr.every((v) => typeof v === 'string'))
    .withMessage(`${field} must be an array of strings`);

const optionalNullableString = (field: string, max = 2000) =>
  body(field)
    .optional({ nullable: true })
    .trim()
    .isLength({ max })
    .withMessage(`${field} must be at most ${max} characters`);

const optionalJson = (field: string) =>
  body(field)
    .optional({ nullable: true })
    .custom((value) => value === null || typeof value === 'object')
    .withMessage(`${field} must be an object, array, or null`);

const coreCreateFields = [
  body('titleFr')
    .trim()
    .notEmpty()
    .withMessage('titleFr is required')
    .isLength({ min: 2, max: 300 })
    .withMessage('titleFr must be between 2 and 300 characters'),
  body('titleEn')
    .trim()
    .notEmpty()
    .withMessage('titleEn is required')
    .isLength({ min: 2, max: 300 })
    .withMessage('titleEn must be between 2 and 300 characters'),
  body('descriptionFr')
    .trim()
    .notEmpty()
    .withMessage('descriptionFr is required')
    .isLength({ max: 5000 })
    .withMessage('descriptionFr must be at most 5000 characters'),
  body('descriptionEn')
    .trim()
    .notEmpty()
    .withMessage('descriptionEn is required')
    .isLength({ max: 5000 })
    .withMessage('descriptionEn must be at most 5000 characters'),
  body('problemFr')
    .trim()
    .notEmpty()
    .withMessage('problemFr is required')
    .isLength({ max: 10_000 })
    .withMessage('problemFr must be at most 10000 characters'),
  body('problemEn')
    .trim()
    .notEmpty()
    .withMessage('problemEn is required')
    .isLength({ max: 10_000 })
    .withMessage('problemEn must be at most 10000 characters'),
  requiredStringArray('solutionFr'),
  requiredStringArray('solutionEn'),
  requiredStringArray('impactFr'),
  requiredStringArray('impactEn'),
  body('techStack')
    .notEmpty()
    .withMessage('techStack is required')
    .custom((value) => typeof value === 'object')
    .withMessage('techStack must be an object or array'),
  body('images')
    .isArray({ min: 1 })
    .withMessage('images must be a non-empty array')
    .bail()
    .custom((arr: unknown[]) => arr.every((v) => typeof v === 'string'))
    .withMessage('images must be an array of strings'),
  body('preview')
    .trim()
    .notEmpty()
    .withMessage('preview is required')
    .isLength({ max: 2000 })
    .withMessage('preview must be at most 2000 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('category is required')
    .isLength({ max: 120 })
    .withMessage('category must be at most 120 characters'),
  body('status')
    .trim()
    .notEmpty()
    .withMessage('status is required')
    .isLength({ max: 80 })
    .withMessage('status must be at most 80 characters'),
  body('complexity')
    .trim()
    .notEmpty()
    .withMessage('complexity is required')
    .isLength({ max: 80 })
    .withMessage('complexity must be at most 80 characters'),
  body('role')
    .trim()
    .notEmpty()
    .withMessage('role is required')
    .isLength({ max: 200 })
    .withMessage('role must be at most 200 characters'),
  body('duration')
    .trim()
    .notEmpty()
    .withMessage('duration is required')
    .isLength({ max: 120 })
    .withMessage('duration must be at most 120 characters'),
  body('date')
    .trim()
    .notEmpty()
    .withMessage('date is required')
    .isLength({ max: 80 })
    .withMessage('date must be at most 80 characters'),
];

const optionalCaseStudyFields = [
  optionalNullableString('fullDescriptionFr', 20_000),
  optionalNullableString('fullDescriptionEn', 20_000),
  optionalStringArray('solutionsFr'),
  optionalStringArray('solutionsEn'),
  optionalStringArray('challengesFr'),
  optionalStringArray('challengesEn'),
  optionalStringArray('resultsFr'),
  optionalStringArray('resultsEn'),
  optionalJson('metrics'),
  optionalStringArray('architecture'),
  optionalStringArray('testing'),
  optionalNullableString('videoDemo', 2000),
  body('teamSize').optional({ nullable: true }).isInt({ min: 1, max: 10_000 }),
  optionalNullableString('github', 2000),
  optionalNullableString('demo', 2000),
  optionalNullableString('caseStudy', 2000),
  optionalNullableString('documentation', 2000),
  optionalNullableString('businessContextFr', 10_000),
  optionalNullableString('businessContextEn', 10_000),
  body('isFeatured').optional().isBoolean(),
  body('isPublished').optional().isBoolean(),
  body('confidential').optional().isBoolean(),
  optionalStringArray('responsibilitiesFr'),
  optionalStringArray('responsibilitiesEn'),
  optionalJson('videos'),
  optionalJson('gallery'),
  optionalJson('diagrams'),
  optionalJson('resources'),
  optionalJson('milestones'),
  optionalStringArray('scopeFr'),
  optionalStringArray('scopeEn'),
  optionalStringArray('nonGoalsFr'),
  optionalStringArray('nonGoalsEn'),
  optionalJson('decisions'),
  optionalStringArray('securityFr'),
  optionalStringArray('securityEn'),
  optionalStringArray('infraFr'),
  optionalStringArray('infraEn'),
  optionalJson('externalLinks'),
  optionalJson('testimonial'),
  optionalStringArray('lessonsFr'),
  optionalStringArray('lessonsEn'),
  optionalJson('beforeAfter'),
  body('sortOrder').optional().isInt({ min: 0, max: 100_000 }),
];

const optionalUpdateCore = [
  body('titleFr')
    .optional()
    .trim()
    .isLength({ min: 2, max: 300 })
    .withMessage('titleFr must be between 2 and 300 characters'),
  body('titleEn')
    .optional()
    .trim()
    .isLength({ min: 2, max: 300 })
    .withMessage('titleEn must be between 2 and 300 characters'),
  body('descriptionFr')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('descriptionFr must be at most 5000 characters'),
  body('descriptionEn')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('descriptionEn must be at most 5000 characters'),
  body('problemFr').optional().trim().isLength({ max: 10_000 }),
  body('problemEn').optional().trim().isLength({ max: 10_000 }),
  optionalStringArray('solutionFr'),
  optionalStringArray('solutionEn'),
  optionalStringArray('impactFr'),
  optionalStringArray('impactEn'),
  optionalJson('techStack'),
  body('images')
    .optional()
    .isArray()
    .withMessage('images must be an array')
    .bail()
    .custom((arr: unknown[]) => arr.every((v) => typeof v === 'string'))
    .withMessage('images must be an array of strings'),
  body('preview').optional().trim().isLength({ max: 2000 }),
  body('category').optional().trim().isLength({ max: 120 }),
  body('status').optional().trim().isLength({ max: 80 }),
  body('complexity').optional().trim().isLength({ max: 80 }),
  body('role').optional().trim().isLength({ max: 200 }),
  body('duration').optional().trim().isLength({ max: 120 }),
  body('date').optional().trim().isLength({ max: 80 }),
];

export const projectSchemas = {
  list: [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('limit must be between 1 and 100'),
    query('isPublished').optional().isBoolean().withMessage('isPublished must be a boolean'),
    query('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean'),
    query('category').optional().trim().isLength({ max: 120 }),
    query('includeUnpublished')
      .optional()
      .isBoolean()
      .withMessage('includeUnpublished must be a boolean'),
  ],

  byId: [projectIdParam],

  create: [...coreCreateFields, ...optionalCaseStudyFields],

  update: [projectIdParam, ...optionalUpdateCore, ...optionalCaseStudyFields],
};
