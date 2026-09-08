import { body, param, query } from 'express-validator';

const bilingualString = (
  field: string,
  opts: { optional?: boolean; min?: number; max?: number; label?: string } = {},
) => {
  const label = opts.label ?? field;
  const min = opts.min ?? 1;
  const max = opts.max ?? 500;
  const chain = opts.optional ? body(field).optional() : body(field);
  return chain
    .trim()
    .notEmpty()
    .withMessage(`${label} is required`)
    .isString()
    .withMessage(`${label} must be a string`)
    .isLength({ min, max })
    .withMessage(`${label} must be between ${min} and ${max} characters`);
};

const contentRule = (field: string, opts: { optional?: boolean } = {}) => {
  const chain = opts.optional ? body(field).optional() : body(field);
  return chain
    .trim()
    .notEmpty()
    .withMessage(`${field} is required`)
    .isString()
    .withMessage(`${field} must be a string`)
    .isLength({ min: 10, max: 50_000 })
    .withMessage(`${field} must be between 10 and 50 000 characters`);
};

const optionalSlug = body('slug')
  .optional()
  .trim()
  .isString()
  .withMessage('Slug must be a string')
  .isLength({ min: 1, max: 220 })
  .withMessage('Slug must be between 1 and 220 characters')
  .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i)
  .withMessage('Slug must be URL-safe (letters, numbers, hyphens)');

const imageRule = (opts: { optional?: boolean } = {}) => {
  const chain = opts.optional ? body('image').optional() : body('image');
  return chain
    .trim()
    .notEmpty()
    .withMessage('Image is required')
    .isString()
    .withMessage('Image must be a string')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Image must be at most 2000 characters');
};

const categoryRule = (opts: { optional?: boolean } = {}) => {
  const chain = opts.optional ? body('category').optional() : body('category');
  return chain
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isString()
    .withMessage('Category must be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters');
};

const dateRule = (opts: { optional?: boolean } = {}) => {
  const chain = opts.optional ? body('date').optional() : body('date');
  return chain
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 datetime')
    .toDate();
};

const readTimeRule = (opts: { optional?: boolean } = {}) => {
  const chain = opts.optional ? body('readTime').optional() : body('readTime');
  return chain
    .trim()
    .notEmpty()
    .withMessage('readTime is required')
    .isString()
    .withMessage('readTime must be a string')
    .isLength({ min: 1, max: 50 })
    .withMessage('readTime must be at most 50 characters');
};

const authorRule = (opts: { optional?: boolean } = {}) => {
  const chain = opts.optional ? body('author').optional() : body('author');
  return chain
    .trim()
    .notEmpty()
    .withMessage('Author is required')
    .isString()
    .withMessage('Author must be a string')
    .isLength({ min: 1, max: 120 })
    .withMessage('Author must be at most 120 characters');
};

const tagsRule = body('tags')
  .optional()
  .isArray({ max: 30 })
  .withMessage('tags must be an array of at most 30 items');

const tagsItemRule = body('tags.*')
  .optional()
  .trim()
  .isString()
  .withMessage('Each tag must be a string')
  .isLength({ min: 1, max: 50 })
  .withMessage('Each tag must be between 1 and 50 characters');

const optionalIsPublished = body('isPublished')
  .optional()
  .isBoolean()
  .withMessage('isPublished must be a boolean')
  .toBoolean();

const blogIdParam = param('id')
  .trim()
  .notEmpty()
  .withMessage('Blog id is required')
  .isMongoId()
  .withMessage('Blog id must be a valid Mongo ObjectId');

const blogSlugParam = param('slug')
  .trim()
  .notEmpty()
  .withMessage('Slug is required')
  .isString()
  .withMessage('Slug must be a string')
  .isLength({ min: 1, max: 220 })
  .withMessage('Slug must be between 1 and 220 characters')
  .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i)
  .withMessage('Slug must be URL-safe (letters, numbers, hyphens)');

const searchQueryRule = query('q')
  .trim()
  .notEmpty()
  .withMessage('Search query (q) is required')
  .isString()
  .withMessage('q must be a string')
  .isLength({ min: 2, max: 200 })
  .withMessage('q must be between 2 and 200 characters');

/**
 * Blog express-validator rules — presentation boundary only.
 * Lives in the blog module; do not re-export from `shared/utils/validation`.
 */
export const blogSchemas = {
  search: [searchQueryRule],

  create: [
    optionalSlug,
    bilingualString('titleFr', { max: 200, label: 'titleFr' }),
    bilingualString('titleEn', { max: 200, label: 'titleEn' }),
    bilingualString('excerptFr', { max: 500, label: 'excerptFr' }),
    bilingualString('excerptEn', { max: 500, label: 'excerptEn' }),
    contentRule('contentFr'),
    contentRule('contentEn'),
    imageRule(),
    categoryRule(),
    dateRule(),
    readTimeRule(),
    authorRule(),
    tagsRule,
    tagsItemRule,
  ],

  update: [
    blogIdParam,
    optionalSlug,
    bilingualString('titleFr', { optional: true, max: 200, label: 'titleFr' }),
    bilingualString('titleEn', { optional: true, max: 200, label: 'titleEn' }),
    bilingualString('excerptFr', { optional: true, max: 500, label: 'excerptFr' }),
    bilingualString('excerptEn', { optional: true, max: 500, label: 'excerptEn' }),
    contentRule('contentFr', { optional: true }),
    contentRule('contentEn', { optional: true }),
    imageRule({ optional: true }),
    categoryRule({ optional: true }),
    dateRule({ optional: true }),
    readTimeRule({ optional: true }),
    authorRule({ optional: true }),
    tagsRule,
    tagsItemRule,
    optionalIsPublished,
  ],

  getBySlug: [blogSlugParam],

  byId: [blogIdParam],
};
