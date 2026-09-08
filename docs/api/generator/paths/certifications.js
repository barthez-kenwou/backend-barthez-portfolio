/**
 * Certifications paths — /api/v1/certifications
 */
const { okContent, bearer, mongoObjectId } = require('../helpers');

const certificationIdParam = {
  name: 'certificationId',
  in: 'path',
  required: true,
  schema: mongoObjectId,
};

const createBody = {
  type: 'object',
  required: ['name', 'issuer', 'year'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 200 },
    issuer: { type: 'string', minLength: 1, maxLength: 200 },
    year: { type: 'string', minLength: 1, maxLength: 20 },
    link: { type: 'string', nullable: true, maxLength: 2048 },
    sortOrder: { type: 'integer', minimum: 0 },
  },
};

module.exports = {
  '/api/v1/certifications': {
    get: {
      tags: ['Certifications'],
      summary: 'List certifications',
      description: 'Public paginated list for Skills / CV. Limit capped at 100.',
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
      ],
      responses: {
        200: okContent(null, 'Certifications list'),
        400: { $ref: '#/components/responses/BadRequest' },
      },
    },
    post: {
      tags: ['Certifications'],
      summary: 'Create certification',
      description: 'Requires `certification:create`.',
      security: bearer,
      requestBody: {
        required: true,
        content: { 'application/json': { schema: createBody } },
      },
      responses: {
        201: okContent(null, 'Certification created'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
      },
    },
  },
  '/api/v1/certifications/{certificationId}': {
    get: {
      tags: ['Certifications'],
      summary: 'Get certification by id',
      description: 'Public detail.',
      parameters: [certificationIdParam],
      responses: {
        200: okContent(null, 'Certification detail'),
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    put: {
      tags: ['Certifications'],
      summary: 'Update certification',
      description: 'Requires `certification:update:own` (owner) or `certification:update:any`.',
      security: bearer,
      parameters: [certificationIdParam],
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
        200: okContent(null, 'Certification updated'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    delete: {
      tags: ['Certifications'],
      summary: 'Soft-delete certification',
      description: 'Requires `certification:delete:own` (owner) or `certification:delete:any`.',
      security: bearer,
      parameters: [certificationIdParam],
      responses: {
        200: okContent(null, 'Certification deleted'),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
  },
};
