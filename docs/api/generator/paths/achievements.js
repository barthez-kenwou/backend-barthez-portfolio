/**
 * Achievements paths — /api/v1/achievements
 */
const { okContent, bearer, mongoObjectId } = require('../helpers');

const achievementIdParam = {
  name: 'achievementId',
  in: 'path',
  required: true,
  schema: mongoObjectId,
};

const createBody = {
  type: 'object',
  required: ['iconKey', 'value', 'labelFr', 'labelEn'],
  properties: {
    iconKey: { type: 'string', minLength: 1, maxLength: 80 },
    value: { type: 'string', minLength: 1, maxLength: 40 },
    labelFr: { type: 'string', minLength: 1, maxLength: 120 },
    labelEn: { type: 'string', minLength: 1, maxLength: 120 },
    sortOrder: { type: 'integer', minimum: 0 },
  },
};

module.exports = {
  '/api/v1/achievements': {
    get: {
      tags: ['Achievements'],
      summary: 'List achievements',
      description: 'Public highlight counters for the Skills page. Limit capped at 100.',
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
      ],
      responses: {
        200: okContent(null, 'Achievements list'),
        400: { $ref: '#/components/responses/BadRequest' },
      },
    },
    post: {
      tags: ['Achievements'],
      summary: 'Create achievement',
      description: 'Requires `achievement:create`.',
      security: bearer,
      requestBody: {
        required: true,
        content: { 'application/json': { schema: createBody } },
      },
      responses: {
        201: okContent(null, 'Achievement created'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
      },
    },
  },
  '/api/v1/achievements/{achievementId}': {
    get: {
      tags: ['Achievements'],
      summary: 'Get achievement by id',
      description: 'Public detail.',
      parameters: [achievementIdParam],
      responses: {
        200: okContent(null, 'Achievement detail'),
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    put: {
      tags: ['Achievements'],
      summary: 'Update achievement',
      description: 'Requires `achievement:update:own` (owner) or `achievement:update:any`.',
      security: bearer,
      parameters: [achievementIdParam],
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
        200: okContent(null, 'Achievement updated'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    delete: {
      tags: ['Achievements'],
      summary: 'Soft-delete achievement',
      description: 'Requires `achievement:delete:own` (owner) or `achievement:delete:any`.',
      security: bearer,
      parameters: [achievementIdParam],
      responses: {
        200: okContent(null, 'Achievement deleted'),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
  },
};
