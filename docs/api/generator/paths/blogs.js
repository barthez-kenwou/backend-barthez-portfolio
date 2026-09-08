/**
 * Blogs paths — /api/v1/blogs
 * Bilingual (FR/EN) portfolio posts with `isPublished`.
 */
const { okContent, bearer, mongoObjectId } = require('../helpers');

const createBody = {
  type: 'object',
  required: [
    'titleFr',
    'titleEn',
    'excerptFr',
    'excerptEn',
    'contentFr',
    'contentEn',
    'image',
    'category',
    'date',
    'readTime',
    'author',
  ],
  properties: {
    slug: {
      type: 'string',
      minLength: 1,
      maxLength: 220,
      description: 'Optional URL slug; generated from titleEn when omitted',
      pattern: '^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$',
    },
    titleFr: { type: 'string', minLength: 1, maxLength: 200 },
    titleEn: { type: 'string', minLength: 1, maxLength: 200 },
    excerptFr: { type: 'string', minLength: 1, maxLength: 500 },
    excerptEn: { type: 'string', minLength: 1, maxLength: 500 },
    contentFr: { type: 'string', minLength: 10, maxLength: 50000 },
    contentEn: { type: 'string', minLength: 10, maxLength: 50000 },
    image: { type: 'string', minLength: 1, maxLength: 2000 },
    category: { type: 'string', minLength: 1, maxLength: 100 },
    date: { type: 'string', format: 'date-time' },
    readTime: { type: 'string', minLength: 1, maxLength: 50 },
    author: { type: 'string', minLength: 1, maxLength: 120 },
    tags: {
      type: 'array',
      maxItems: 30,
      items: { type: 'string', minLength: 1, maxLength: 50 },
    },
  },
};

const updateBody = {
  type: 'object',
  minProperties: 1,
  properties: {
    ...createBody.properties,
    isPublished: {
      type: 'boolean',
      description: 'Publish flag (also set by PATCH /publish)',
    },
  },
};

module.exports = {
  '/api/v1/blogs/search': {
    get: {
      tags: ['Blogs'],
      summary: 'Search published blogs',
      description:
        'Search over published posts (`isPublished=true`). Cap 100 results. Bilingual fields are searchable.',
      parameters: [
        {
          name: 'q',
          in: 'query',
          required: true,
          schema: { type: 'string', minLength: 2, maxLength: 200 },
          description: 'Search text (2–200 characters)',
        },
        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
        },
      ],
      responses: {
        200: okContent(null, 'Search hits'),
        400: { $ref: '#/components/responses/BadRequest' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
  '/api/v1/blogs': {
    get: {
      tags: ['Blogs'],
      summary: 'List blog posts',
      description: 'Paginated public listing of published bilingual posts. Limit capped at 100.',
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
        },
      ],
      responses: {
        200: {
          description: 'Paginated blog list',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Blog' },
                  },
                  pagination: { $ref: '#/components/schemas/PaginationMeta' },
                },
              },
            },
          },
        },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    post: {
      tags: ['Blogs'],
      summary: 'Create blog post',
      description:
        'Creates an unpublished bilingual post. Requires authentication and `blog:create`.',
      security: bearer,
      requestBody: {
        required: true,
        content: { 'application/json': { schema: createBody } },
      },
      responses: {
        201: okContent('#/components/schemas/Blog', 'Blog created'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
  '/api/v1/blogs/{slug}': {
    get: {
      tags: ['Blogs'],
      summary: 'Get blog by slug',
      description: 'Returns a single published blog post by URL slug.',
      parameters: [
        {
          name: 'slug',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            minLength: 1,
            maxLength: 220,
            pattern: '^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$',
          },
          example: 'getting-started-with-nodejs',
        },
      ],
      responses: {
        200: okContent('#/components/schemas/Blog', 'Blog details'),
        404: { $ref: '#/components/responses/NotFound' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
  '/api/v1/blogs/{id}': {
    put: {
      tags: ['Blogs'],
      summary: 'Update blog post',
      description:
        'Partial update. All body fields optional. Requires `blog:update:own` (or `:any`).',
      security: bearer,
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: mongoObjectId,
        },
      ],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: updateBody } },
      },
      responses: {
        200: okContent('#/components/schemas/Blog', 'Blog updated'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
    delete: {
      tags: ['Blogs'],
      summary: 'Delete blog post',
      description: 'Soft-deletes a blog post. Requires `blog:delete:own` (or `:any`).',
      security: bearer,
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: mongoObjectId,
        },
      ],
      responses: {
        200: okContent(null, 'Blog deleted'),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
  '/api/v1/blogs/{id}/publish': {
    patch: {
      tags: ['Blogs'],
      summary: 'Publish blog post',
      description: 'Sets `isPublished=true`. Requires `blog:publish`.',
      security: bearer,
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: mongoObjectId,
        },
      ],
      responses: {
        200: okContent('#/components/schemas/Blog', 'Blog published'),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
};
