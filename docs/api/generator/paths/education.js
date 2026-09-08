/**
 * Education paths — /api/v1/education
 */
const { okContent, bearer, mongoObjectId } = require('../helpers');

const educationIdParam = {
  name: 'educationId',
  in: 'path',
  required: true,
  schema: mongoObjectId,
};

const createBody = {
  type: 'object',
  required: ['degreeFr', 'degreeEn', 'school', 'period'],
  properties: {
    degreeFr: { type: 'string', minLength: 1, maxLength: 200 },
    degreeEn: { type: 'string', minLength: 1, maxLength: 200 },
    school: { type: 'string', minLength: 1, maxLength: 200 },
    period: { type: 'string', minLength: 1, maxLength: 120 },
    link: { type: 'string', nullable: true, maxLength: 2048 },
    sortOrder: { type: 'integer', minimum: 0 },
  },
};

module.exports = {
  '/api/v1/education': {
    get: {
      tags: ['Education'],
      summary: 'List education entries',
      description: 'Public paginated list for CV. Limit capped at 100.',
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
      ],
      responses: {
        200: okContent(null, 'Education list'),
        400: { $ref: '#/components/responses/BadRequest' },
      },
    },
    post: {
      tags: ['Education'],
      summary: 'Create education entry',
      description: 'Requires `education:create`.',
      security: bearer,
      requestBody: {
        required: true,
        content: { 'application/json': { schema: createBody } },
      },
      responses: {
        201: okContent(null, 'Education created'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
      },
    },
  },
  '/api/v1/education/{educationId}': {
    get: {
      tags: ['Education'],
      summary: 'Get education by id',
      description: 'Public detail.',
      parameters: [educationIdParam],
      responses: {
        200: okContent(null, 'Education detail'),
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    put: {
      tags: ['Education'],
      summary: 'Update education entry',
      description: 'Requires `education:update:own` (owner) or `education:update:any`.',
      security: bearer,
      parameters: [educationIdParam],
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
        200: okContent(null, 'Education updated'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    delete: {
      tags: ['Education'],
      summary: 'Soft-delete education entry',
      description: 'Requires `education:delete:own` (owner) or `education:delete:any`.',
      security: bearer,
      parameters: [educationIdParam],
      responses: {
        200: okContent(null, 'Education deleted'),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
  },
};
