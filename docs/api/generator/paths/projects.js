/**
 * Projects paths — /api/v1/projects
 * Portfolio case studies (bilingual, featured / published / confidential).
 */
const { okContent, bearer, mongoObjectId } = require('../helpers');

const projectIdParam = {
  name: 'projectId',
  in: 'path',
  required: true,
  schema: mongoObjectId,
};

const stringArray = { type: 'array', items: { type: 'string' } };

const createBody = {
  type: 'object',
  required: [
    'titleFr',
    'titleEn',
    'descriptionFr',
    'descriptionEn',
    'problemFr',
    'problemEn',
    'solutionFr',
    'solutionEn',
    'impactFr',
    'impactEn',
    'techStack',
    'images',
    'preview',
    'category',
    'status',
    'complexity',
    'role',
    'duration',
    'date',
  ],
  properties: {
    titleFr: { type: 'string', minLength: 2, maxLength: 300 },
    titleEn: { type: 'string', minLength: 2, maxLength: 300 },
    descriptionFr: { type: 'string', maxLength: 5000 },
    descriptionEn: { type: 'string', maxLength: 5000 },
    problemFr: { type: 'string', maxLength: 10000 },
    problemEn: { type: 'string', maxLength: 10000 },
    solutionFr: stringArray,
    solutionEn: stringArray,
    impactFr: stringArray,
    impactEn: stringArray,
    techStack: {
      description: 'Object or array describing the stack',
      oneOf: [{ type: 'object', additionalProperties: true }, { type: 'array' }],
    },
    images: { type: 'array', minItems: 1, items: { type: 'string' } },
    preview: { type: 'string', maxLength: 2000 },
    category: { type: 'string', maxLength: 120 },
    status: { type: 'string', maxLength: 80 },
    complexity: { type: 'string', maxLength: 80 },
    role: { type: 'string', maxLength: 200 },
    duration: { type: 'string', maxLength: 120 },
    date: { type: 'string', maxLength: 80 },
    isFeatured: { type: 'boolean' },
    isPublished: { type: 'boolean' },
    confidential: {
      type: 'boolean',
      description: 'When true, public responses redact github/demo (and similar) links',
    },
    sortOrder: { type: 'integer', minimum: 0 },
    github: { type: 'string', nullable: true, maxLength: 2000 },
    demo: { type: 'string', nullable: true, maxLength: 2000 },
    fullDescriptionFr: { type: 'string', nullable: true },
    fullDescriptionEn: { type: 'string', nullable: true },
  },
};

module.exports = {
  '/api/v1/projects': {
    get: {
      tags: ['Projects'],
      summary: 'List projects',
      description:
        'Public list of published projects by default. ' +
        '`includeUnpublished=true` requires bearer + `project:read`. ' +
        'Optional filters: `isPublished`, `isFeatured`, `category`. Limit ≤ 100.',
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
        { name: 'isPublished', in: 'query', schema: { type: 'boolean' } },
        { name: 'isFeatured', in: 'query', schema: { type: 'boolean' } },
        { name: 'category', in: 'query', schema: { type: 'string', maxLength: 120 } },
        {
          name: 'includeUnpublished',
          in: 'query',
          schema: { type: 'boolean' },
          description: 'When true, requires authentication and `project:read`',
        },
      ],
      responses: {
        200: okContent(null, 'Projects list'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
      },
    },
    post: {
      tags: ['Projects'],
      summary: 'Create project',
      description: 'Requires `project:create`. Bilingual case-study fields.',
      security: bearer,
      requestBody: {
        required: true,
        content: { 'application/json': { schema: createBody } },
      },
      responses: {
        201: okContent(null, 'Project created'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
      },
    },
  },
  '/api/v1/projects/{projectId}': {
    get: {
      tags: ['Projects'],
      summary: 'Get project by id',
      description:
        'Public detail for published projects. Confidential projects redact ' +
        'sensitive links (e.g. github, demo) for unauthenticated / non-privileged callers.',
      parameters: [projectIdParam],
      responses: {
        200: okContent(null, 'Project detail'),
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    put: {
      tags: ['Projects'],
      summary: 'Update project',
      description: 'Requires `project:update:own` (owner) or `project:update:any`.',
      security: bearer,
      parameters: [projectIdParam],
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
        200: okContent(null, 'Project updated'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    delete: {
      tags: ['Projects'],
      summary: 'Soft-delete project',
      description: 'Requires `project:delete:own` (owner) or `project:delete:any`.',
      security: bearer,
      parameters: [projectIdParam],
      responses: {
        200: okContent(null, 'Project deleted'),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
  },
};
