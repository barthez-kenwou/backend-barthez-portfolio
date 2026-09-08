/**
 * Experiences paths — /api/v1/experiences
 */
const { okContent, bearer, mongoObjectId } = require('../helpers');

const experienceIdParam = {
  name: 'experienceId',
  in: 'path',
  required: true,
  schema: mongoObjectId,
};

const createBody = {
  type: 'object',
  required: [
    'titleFr',
    'titleEn',
    'companyFr',
    'companyEn',
    'period',
    'descriptionFr',
    'descriptionEn',
  ],
  properties: {
    titleFr: { type: 'string', minLength: 1, maxLength: 200 },
    titleEn: { type: 'string', minLength: 1, maxLength: 200 },
    companyFr: { type: 'string', minLength: 1, maxLength: 200 },
    companyEn: { type: 'string', minLength: 1, maxLength: 200 },
    period: { type: 'string', minLength: 1, maxLength: 120 },
    descriptionFr: { type: 'array', items: { type: 'string', maxLength: 1000 } },
    descriptionEn: { type: 'array', items: { type: 'string', maxLength: 1000 } },
    sortOrder: { type: 'integer', minimum: 0 },
  },
};

module.exports = {
  '/api/v1/experiences': {
    get: {
      tags: ['Experiences'],
      summary: 'List experiences',
      description: 'Public paginated list for CV / About. Limit capped at 100.',
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
      ],
      responses: {
        200: okContent(null, 'Experiences list'),
        400: { $ref: '#/components/responses/BadRequest' },
      },
    },
    post: {
      tags: ['Experiences'],
      summary: 'Create experience',
      description: 'Requires `experience:create`.',
      security: bearer,
      requestBody: {
        required: true,
        content: { 'application/json': { schema: createBody } },
      },
      responses: {
        201: okContent(null, 'Experience created'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
      },
    },
  },
  '/api/v1/experiences/{experienceId}': {
    get: {
      tags: ['Experiences'],
      summary: 'Get experience by id',
      description: 'Public detail.',
      parameters: [experienceIdParam],
      responses: {
        200: okContent(null, 'Experience detail'),
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    put: {
      tags: ['Experiences'],
      summary: 'Update experience',
      description: 'Requires `experience:update:own` (owner) or `experience:update:any`.',
      security: bearer,
      parameters: [experienceIdParam],
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
        200: okContent(null, 'Experience updated'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    delete: {
      tags: ['Experiences'],
      summary: 'Soft-delete experience',
      description: 'Requires `experience:delete:own` (owner) or `experience:delete:any`.',
      security: bearer,
      parameters: [experienceIdParam],
      responses: {
        200: okContent(null, 'Experience deleted'),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
  },
};
