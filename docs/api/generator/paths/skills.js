/**
 * Skills paths — /api/v1/skills
 */
const { okContent, bearer, mongoObjectId } = require('../helpers');

const skillIdParam = {
  name: 'skillId',
  in: 'path',
  required: true,
  schema: mongoObjectId,
};

const createBody = {
  type: 'object',
  required: ['name', 'category', 'level', 'icon'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 120 },
    category: { type: 'string', minLength: 1, maxLength: 80 },
    level: { type: 'integer', minimum: 0, maximum: 100 },
    icon: { type: 'string', minLength: 1, maxLength: 2048 },
    sortOrder: { type: 'integer', minimum: 0 },
  },
};

module.exports = {
  '/api/v1/skills': {
    get: {
      tags: ['Skills'],
      summary: 'List skills',
      description: 'Public paginated skill matrix. Limit capped at 100.',
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
      ],
      responses: {
        200: okContent(null, 'Skills list'),
        400: { $ref: '#/components/responses/BadRequest' },
      },
    },
    post: {
      tags: ['Skills'],
      summary: 'Create skill',
      description: 'Requires `skill:create`.',
      security: bearer,
      requestBody: {
        required: true,
        content: { 'application/json': { schema: createBody } },
      },
      responses: {
        201: okContent(null, 'Skill created'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
      },
    },
  },
  '/api/v1/skills/{skillId}': {
    get: {
      tags: ['Skills'],
      summary: 'Get skill by id',
      description: 'Public detail.',
      parameters: [skillIdParam],
      responses: {
        200: okContent(null, 'Skill detail'),
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    put: {
      tags: ['Skills'],
      summary: 'Update skill',
      description: 'Requires `skill:update:own` (owner) or `skill:update:any`.',
      security: bearer,
      parameters: [skillIdParam],
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
        200: okContent(null, 'Skill updated'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    delete: {
      tags: ['Skills'],
      summary: 'Soft-delete skill',
      description: 'Requires `skill:delete:own` (owner) or `skill:delete:any`.',
      security: bearer,
      parameters: [skillIdParam],
      responses: {
        200: okContent(null, 'Skill deleted'),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
  },
};
