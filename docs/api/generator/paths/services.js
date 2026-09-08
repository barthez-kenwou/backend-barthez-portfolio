/**
 * Services paths — /api/v1/services
 */
const { okContent, bearer, mongoObjectId } = require('../helpers');

const serviceIdParam = {
  name: 'serviceId',
  in: 'path',
  required: true,
  schema: mongoObjectId,
};

const createBody = {
  type: 'object',
  required: [
    'iconKey',
    'titleFr',
    'titleEn',
    'descFr',
    'descEn',
    'featuresFr',
    'featuresEn',
    'priceEur',
    'priceFr',
    'priceEn',
  ],
  properties: {
    iconKey: { type: 'string', minLength: 1, maxLength: 80 },
    titleFr: { type: 'string', minLength: 1, maxLength: 200 },
    titleEn: { type: 'string', minLength: 1, maxLength: 200 },
    descFr: { type: 'string', minLength: 1, maxLength: 5000 },
    descEn: { type: 'string', minLength: 1, maxLength: 5000 },
    featuresFr: { type: 'array', items: { type: 'string', maxLength: 1000 } },
    featuresEn: { type: 'array', items: { type: 'string', maxLength: 1000 } },
    priceEur: {
      type: 'number',
      minimum: 0,
      description: 'EUR source of truth for pricing',
    },
    hourly: { type: 'boolean' },
    priceFr: { type: 'string', minLength: 1, maxLength: 80 },
    priceEn: { type: 'string', minLength: 1, maxLength: 80 },
    sortOrder: { type: 'integer', minimum: 0 },
    isPublished: { type: 'boolean' },
  },
};

module.exports = {
  '/api/v1/services': {
    get: {
      tags: ['Services'],
      summary: 'List services',
      description: 'Public paginated list. Limit capped at 100.',
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
      ],
      responses: {
        200: okContent(null, 'Services list'),
        400: { $ref: '#/components/responses/BadRequest' },
      },
    },
    post: {
      tags: ['Services'],
      summary: 'Create service',
      description: 'Requires `service:create`.',
      security: bearer,
      requestBody: {
        required: true,
        content: { 'application/json': { schema: createBody } },
      },
      responses: {
        201: okContent(null, 'Service created'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
      },
    },
  },
  '/api/v1/services/{serviceId}': {
    get: {
      tags: ['Services'],
      summary: 'Get service by id',
      description: 'Public detail.',
      parameters: [serviceIdParam],
      responses: {
        200: okContent(null, 'Service detail'),
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    put: {
      tags: ['Services'],
      summary: 'Update service',
      description: 'Requires `service:update:own` (owner) or `service:update:any`.',
      security: bearer,
      parameters: [serviceIdParam],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              minProperties: 1,
              properties: createBody.properties,
            },
          },
        },
      },
      responses: {
        200: okContent(null, 'Service updated'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    delete: {
      tags: ['Services'],
      summary: 'Soft-delete service',
      description: 'Requires `service:delete:own` (owner) or `service:delete:any`.',
      security: bearer,
      parameters: [serviceIdParam],
      responses: {
        200: okContent(null, 'Service deleted'),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
  },
};
