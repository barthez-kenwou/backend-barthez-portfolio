/**
 * Newsletter paths — /api/v1/newsletter
 * Public subscribe / confirm / unsubscribe; admin CRM + broadcast.
 */
const { okContent, bearer, mongoObjectId } = require('../helpers');

const subscriberIdParam = {
  name: 'subscriberId',
  in: 'path',
  required: true,
  schema: mongoObjectId,
};

const subscribeBody = {
  type: 'object',
  required: ['email'],
  properties: {
    email: { type: 'string', format: 'email' },
    locale: { type: 'string', enum: ['fr', 'en'] },
    source: { type: 'string', maxLength: 64, example: 'blog' },
  },
};

const broadcastBody = {
  type: 'object',
  required: ['subjectFr', 'subjectEn', 'headlineFr', 'headlineEn', 'bodyFr', 'bodyEn'],
  properties: {
    subjectFr: { type: 'string', maxLength: 200 },
    subjectEn: { type: 'string', maxLength: 200 },
    previewFr: { type: 'string', maxLength: 200 },
    previewEn: { type: 'string', maxLength: 200 },
    headlineFr: { type: 'string', maxLength: 200 },
    headlineEn: { type: 'string', maxLength: 200 },
    bodyFr: { type: 'string', maxLength: 20000 },
    bodyEn: { type: 'string', maxLength: 20000 },
    ctaUrl: { type: 'string', format: 'uri' },
    ctaLabelFr: { type: 'string', maxLength: 80 },
    ctaLabelEn: { type: 'string', maxLength: 80 },
  },
};

module.exports = {
  '/api/v1/newsletter/subscribe': {
    post: {
      tags: ['Newsletter'],
      summary: 'Subscribe (double opt-in)',
      description:
        'Public. Always returns a generic success. Sends a confirmation email when the address is new, pending, or previously unsubscribed.',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: subscribeBody } },
      },
      responses: {
        201: okContent(null, 'Confirmation email may be on its way'),
        400: { $ref: '#/components/responses/BadRequest' },
      },
    },
  },
  '/api/v1/newsletter/confirm': {
    get: {
      tags: ['Newsletter'],
      summary: 'Confirm subscription',
      description:
        'Activates the subscriber and sends the welcome email. HTML clients redirect to the blog.',
      parameters: [
        { name: 'token', in: 'query', required: true, schema: { type: 'string', minLength: 16 } },
      ],
      responses: {
        200: okContent(null, 'Subscription confirmed'),
        302: { description: 'Redirect to frontend blog with ?newsletter=confirmed' },
        400: { $ref: '#/components/responses/BadRequest' },
      },
    },
  },
  '/api/v1/newsletter/unsubscribe': {
    get: {
      tags: ['Newsletter'],
      summary: 'One-click unsubscribe',
      parameters: [
        { name: 'token', in: 'query', required: true, schema: { type: 'string', minLength: 16 } },
      ],
      responses: {
        200: okContent(null, 'Unsubscribed'),
        302: { description: 'Redirect to frontend blog with ?newsletter=unsubscribed' },
        400: { $ref: '#/components/responses/BadRequest' },
      },
    },
    post: {
      tags: ['Newsletter'],
      summary: 'Unsubscribe (JSON)',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['token'],
              properties: { token: { type: 'string', minLength: 16 } },
            },
          },
        },
      },
      responses: {
        200: okContent(null, 'Unsubscribed'),
        400: { $ref: '#/components/responses/BadRequest' },
      },
    },
  },
  '/api/v1/newsletter/stats': {
    get: {
      tags: ['Newsletter'],
      summary: 'Subscriber KPIs',
      security: bearer,
      responses: {
        200: okContent(null, 'Newsletter stats'),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
      },
    },
  },
  '/api/v1/newsletter/subscribers': {
    get: {
      tags: ['Newsletter'],
      summary: 'List subscribers',
      security: bearer,
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
        {
          name: 'status',
          in: 'query',
          schema: { type: 'string', enum: ['pending', 'active', 'unsubscribed', 'bounced'] },
        },
        { name: 'locale', in: 'query', schema: { type: 'string', enum: ['fr', 'en'] } },
        { name: 'q', in: 'query', schema: { type: 'string' } },
      ],
      responses: {
        200: okContent(null, 'Subscribers list'),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
      },
    },
  },
  '/api/v1/newsletter/subscribers/{subscriberId}': {
    get: {
      tags: ['Newsletter'],
      summary: 'Get subscriber',
      security: bearer,
      parameters: [subscriberIdParam],
      responses: {
        200: okContent(null, 'Subscriber'),
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    delete: {
      tags: ['Newsletter'],
      summary: 'Soft-delete subscriber',
      security: bearer,
      parameters: [subscriberIdParam],
      responses: {
        200: okContent(null, 'Subscriber deleted'),
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
  },
  '/api/v1/newsletter/campaigns': {
    get: {
      tags: ['Newsletter'],
      summary: 'List campaigns',
      security: bearer,
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
        {
          name: 'type',
          in: 'query',
          schema: {
            type: 'string',
            enum: ['confirm', 'welcome', 'blog_publish', 'digest', 'broadcast'],
          },
        },
        {
          name: 'status',
          in: 'query',
          schema: {
            type: 'string',
            enum: ['queued', 'sending', 'sent', 'failed', 'cancelled'],
          },
        },
      ],
      responses: {
        200: okContent(null, 'Campaigns list'),
      },
    },
  },
  '/api/v1/newsletter/campaigns/broadcast': {
    post: {
      tags: ['Newsletter'],
      summary: 'Queue custom broadcast',
      description: 'Requires `newsletter:broadcast`. Fans out via BullMQ.',
      security: bearer,
      requestBody: {
        required: true,
        content: { 'application/json': { schema: broadcastBody } },
      },
      responses: {
        201: okContent(null, 'Broadcast queued'),
        400: { $ref: '#/components/responses/BadRequest' },
        403: { $ref: '#/components/responses/Forbidden' },
      },
    },
  },
};
