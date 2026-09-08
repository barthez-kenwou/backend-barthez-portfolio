/**
 * Languages paths — /api/v1/languages
 */
const { okContent, bearer, mongoObjectId } = require('../helpers');

const languageIdParam = {
  name: 'languageId',
  in: 'path',
  required: true,
  schema: mongoObjectId,
};

const createBody = {
  type: 'object',
  required: ['language', 'proficiencyFr', 'proficiencyEn'],
  properties: {
    language: { type: 'string', minLength: 1, maxLength: 80 },
    proficiencyFr: { type: 'string', minLength: 1, maxLength: 120 },
    proficiencyEn: { type: 'string', minLength: 1, maxLength: 120 },
    sortOrder: { type: 'integer', minimum: 0 },
  },
};

module.exports = {
  '/api/v1/languages': {
    get: {
      tags: ['Languages'],
      summary: 'List languages',
      description: 'Public spoken-language list for the CV. Limit capped at 100.',
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
      ],
      responses: {
        200: okContent(null, 'Languages list'),
        400: { $ref: '#/components/responses/BadRequest' },
      },
    },
    post: {
      tags: ['Languages'],
      summary: 'Create language',
      description: 'Requires `language:create`.',
      security: bearer,
      requestBody: {
        required: true,
        content: { 'application/json': { schema: createBody } },
      },
      responses: {
        201: okContent(null, 'Language created'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
      },
    },
  },
  '/api/v1/languages/{languageId}': {
    get: {
      tags: ['Languages'],
      summary: 'Get language by id',
      description: 'Public detail.',
      parameters: [languageIdParam],
      responses: {
        200: okContent(null, 'Language detail'),
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    put: {
      tags: ['Languages'],
      summary: 'Update language',
      description: 'Requires `language:update:own` (owner) or `language:update:any`.',
      security: bearer,
      parameters: [languageIdParam],
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
        200: okContent(null, 'Language updated'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    delete: {
      tags: ['Languages'],
      summary: 'Soft-delete language',
      description: 'Requires `language:delete:own` (owner) or `language:delete:any`.',
      security: bearer,
      parameters: [languageIdParam],
      responses: {
        200: okContent(null, 'Language deleted'),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
  },
};
