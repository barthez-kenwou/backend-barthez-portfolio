import { body, param, query } from 'express-validator';

const locales = ['fr', 'en'] as const;
const statuses = ['pending', 'active', 'unsubscribed', 'bounced'] as const;
const campaignTypes = ['confirm', 'welcome', 'blog_publish', 'digest', 'broadcast'] as const;
const campaignStatuses = ['queued', 'sending', 'sent', 'failed', 'cancelled'] as const;

export const newsletterSchemas = {
  subscribe: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('locale')
      .optional()
      .isIn([...locales]),
    body('source').optional().isString().trim().isLength({ max: 64 }),
  ],

  tokenQuery: [query('token').isString().trim().isLength({ min: 16, max: 128 })],

  unsubscribeBody: [body('token').isString().trim().isLength({ min: 16, max: 128 })],

  listSubscribers: [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status')
      .optional()
      .isIn([...statuses]),
    query('locale')
      .optional()
      .isIn([...locales]),
    query('q').optional().isString().trim().isLength({ max: 200 }),
  ],

  byId: [param('subscriberId').isMongoId()],

  listCampaigns: [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('type')
      .optional()
      .isIn([...campaignTypes]),
    query('status')
      .optional()
      .isIn([...campaignStatuses]),
  ],

  broadcast: [
    body('subjectFr').isString().trim().isLength({ min: 3, max: 200 }),
    body('subjectEn').isString().trim().isLength({ min: 3, max: 200 }),
    body('previewFr').optional().isString().trim().isLength({ max: 200 }),
    body('previewEn').optional().isString().trim().isLength({ max: 200 }),
    body('headlineFr').isString().trim().isLength({ min: 3, max: 200 }),
    body('headlineEn').isString().trim().isLength({ min: 3, max: 200 }),
    body('bodyFr').isString().trim().isLength({ min: 10, max: 20000 }),
    body('bodyEn').isString().trim().isLength({ min: 10, max: 20000 }),
    body('ctaUrl').optional().isURL({ require_protocol: true }),
    body('ctaLabelFr').optional().isString().trim().isLength({ max: 80 }),
    body('ctaLabelEn').optional().isString().trim().isLength({ max: 80 }),
  ],
};
