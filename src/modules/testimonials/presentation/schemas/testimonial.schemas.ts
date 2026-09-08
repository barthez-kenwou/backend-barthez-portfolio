/**
 * Testimonial express-validator rules.
 */
import { body, param, query } from 'express-validator';

const testimonialIdParam = param('testimonialId')
  .trim()
  .notEmpty()
  .withMessage('Testimonial ID is required')
  .isMongoId()
  .withMessage('Testimonial ID must be a valid Mongo ObjectId');

const optionalProjectId = body('projectId')
  .optional({ nullable: true })
  .customSanitizer((value) => (value === '' || value === undefined ? null : value))
  .custom((value) => {
    if (value === null) return true;
    return /^[a-f\d]{24}$/i.test(String(value));
  })
  .withMessage('projectId must be a valid Mongo ObjectId');

const coreFields = (optional = false) => {
  const rating = optional
    ? body('rating').optional().isInt({ min: 1, max: 5 })
    : body('rating').isInt({ min: 1, max: 5 }).withMessage('rating must be 1-5');

  const str = (field: string, max: number) =>
    optional
      ? body(field).optional().trim().isLength({ min: 1, max })
      : body(field)
          .trim()
          .notEmpty()
          .withMessage(`${field} is required`)
          .isLength({ max })
          .withMessage(`${field} must be at most ${max} characters`);

  return [
    rating,
    str('textFr', 5000),
    str('textEn', 5000),
    str('nameFr', 200),
    str('nameEn', 200),
    str('roleFr', 200),
    str('roleEn', 200),
    body('company').optional({ nullable: true }).trim().isLength({ max: 200 }),
    body('email').optional({ nullable: true }).trim().isEmail().withMessage('email must be valid'),
    optionalProjectId,
  ];
};

export const testimonialSchemas = {
  list: [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['pending', 'approved', 'rejected']),
    query('isPublished').optional().isBoolean(),
    query('projectId')
      .optional()
      .isMongoId()
      .withMessage('projectId must be a valid Mongo ObjectId'),
  ],

  byId: [testimonialIdParam],

  create: [
    ...coreFields(false),
    body('isPublished').optional().isBoolean(),
    body('status').optional().isIn(['pending', 'approved', 'rejected']),
    body('sortOrder').optional().isInt({ min: 0 }),
  ],

  publicSubmit: [...coreFields(false)],

  update: [
    testimonialIdParam,
    ...coreFields(true),
    body('isPublished').optional().isBoolean(),
    body('status').optional().isIn(['pending', 'approved', 'rejected']),
    body('sortOrder').optional().isInt({ min: 0 }),
  ],
};
