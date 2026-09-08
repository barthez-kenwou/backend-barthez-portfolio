/**
 * References paths — /api/v1/references
 * Professional references contain PII — list/get require auth.
 */
const { okContent, bearer, mongoObjectId } = require('../helpers');

const referenceIdParam = {
  name: 'referenceId',
  in: 'path',
  required: true,
  schema: mongoObjectId,
};

const createBody = {
  type: 'object',
  required: ['name', 'roleFr', 'roleEn', 'company', 'email', 'phone'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 120 },
    roleFr: { type: 'string', minLength: 1, maxLength: 120 },
    roleEn: { type: 'string', minLength: 1, maxLength: 120 },
    company: { type: 'string', minLength: 1, maxLength: 200 },
    email: { type: 'string', format: 'email', maxLength: 254 },
    phone: { type: 'string', minLength: 1, maxLength: 40 },
    sortOrder: { type: 'integer', minimum: 0 },
  },
};

module.exports = {
  '/api/v1/references': {
    get: {
      tags: ['References'],
      summary: 'List references',
      description:
        'Paginated list of professional references (PII). Requires `reference:read`. ' +
        'Also included in the public CV aggregate. Limit ≤ 100.',
      security: bearer,
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
      ],
      responses: {
        200: okContent(null, 'References list'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
      },
    },
    post: {
      tags: ['References'],
      summary: 'Create reference',
      description: 'Requires `reference:create`.',
      security: bearer,
      requestBody: {
        required: true,
        content: { 'application/json': { schema: createBody } },
      },
      responses: {
        201: okContent(null, 'Reference created'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
      },
    },
  },
  '/api/v1/references/{referenceId}': {
    get: {
      tags: ['References'],
      summary: 'Get reference by id',
      description: 'Requires `reference:read` (PII).',
      security: bearer,
      parameters: [referenceIdParam],
      responses: {
        200: okContent(null, 'Reference detail'),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    put: {
      tags: ['References'],
      summary: 'Update reference',
      description: 'Requires `reference:update:own` (owner) or `reference:update:any`.',
      security: bearer,
      parameters: [referenceIdParam],
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
        200: okContent(null, 'Reference updated'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    delete: {
      tags: ['References'],
      summary: 'Soft-delete reference',
      description: 'Requires `reference:delete:own` (owner) or `reference:delete:any`.',
      security: bearer,
      parameters: [referenceIdParam],
      responses: {
        200: okContent(null, 'Reference deleted'),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
  },
};
