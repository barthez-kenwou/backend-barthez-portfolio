/**
 * Partners paths — /api/v1/partners
 * Collaboration logos for the homepage trust strip.
 */
const { okContent, bearer, mongoObjectId } = require('../helpers');

const partnerIdParam = {
  name: 'partnerId',
  in: 'path',
  required: true,
  schema: mongoObjectId,
};

const createBody = {
  type: 'object',
  required: ['name', 'logoUrl'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 160 },
    logoUrl: { type: 'string', minLength: 1, maxLength: 2048 },
    websiteUrl: { type: 'string' },
    descriptionFr: { type: 'string', maxLength: 500 },
    descriptionEn: { type: 'string', maxLength: 500 },
    relationFr: { type: 'string', maxLength: 120 },
    relationEn: { type: 'string', maxLength: 120 },
    sortOrder: { type: 'integer', minimum: 0 },
    isPublished: { type: 'boolean' },
  },
};

const updateBody = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 160 },
    logoUrl: { type: 'string', minLength: 1, maxLength: 2048 },
    websiteUrl: { type: 'string', nullable: true },
    descriptionFr: { type: 'string', nullable: true, maxLength: 500 },
    descriptionEn: { type: 'string', nullable: true, maxLength: 500 },
    relationFr: { type: 'string', nullable: true, maxLength: 120 },
    relationEn: { type: 'string', nullable: true, maxLength: 120 },
    sortOrder: { type: 'integer', minimum: 0 },
    isPublished: { type: 'boolean' },
  },
};

module.exports = {
  '/api/v1/partners': {
    get: {
      tags: ['Partners'],
      summary: 'List partners',
      description:
        'Public paginated list of collaboration logos. Defaults to published only. Pass `includeUnpublished=true` for CMS inventory.',
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
        { name: 'isPublished', in: 'query', schema: { type: 'boolean' } },
        { name: 'includeUnpublished', in: 'query', schema: { type: 'boolean' } },
      ],
      responses: {
        200: okContent(null, 'Partners list (items, totalItems, totalPages, currentPage)'),
        400: { $ref: '#/components/responses/BadRequest' },
      },
    },
    post: {
      tags: ['Partners'],
      summary: 'Create partner',
      description: 'Requires `partner:create`.',
      security: bearer,
      requestBody: {
        required: true,
        content: { 'application/json': { schema: createBody } },
      },
      responses: {
        201: okContent(null, 'Partner created'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
      },
    },
  },
  '/api/v1/partners/{partnerId}': {
    get: {
      tags: ['Partners'],
      summary: 'Get partner',
      parameters: [partnerIdParam],
      responses: {
        200: okContent(null, 'Partner detail'),
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    put: {
      tags: ['Partners'],
      summary: 'Update partner',
      description: 'Requires `partner:update:own` (admins elevate).',
      security: bearer,
      parameters: [partnerIdParam],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: updateBody } },
      },
      responses: {
        200: okContent(null, 'Partner updated'),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    delete: {
      tags: ['Partners'],
      summary: 'Delete partner (soft)',
      description: 'Requires `partner:delete:own` (admins elevate).',
      security: bearer,
      parameters: [partnerIdParam],
      responses: {
        200: okContent(null, 'Partner deleted'),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
  },
};
