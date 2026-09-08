/**
 * Testimonials paths — /api/v1/testimonials
 * Public approved list + public feedback form + admin moderation.
 */
const { okContent, bearer, mongoObjectId } = require('../helpers');

const testimonialIdParam = {
  name: 'testimonialId',
  in: 'path',
  required: true,
  schema: mongoObjectId,
};

const coreProperties = {
  rating: { type: 'integer', minimum: 1, maximum: 5 },
  textFr: { type: 'string', maxLength: 5000 },
  textEn: { type: 'string', maxLength: 5000 },
  nameFr: { type: 'string', maxLength: 200 },
  nameEn: { type: 'string', maxLength: 200 },
  roleFr: { type: 'string', maxLength: 200 },
  roleEn: { type: 'string', maxLength: 200 },
  company: { type: 'string', nullable: true, maxLength: 200 },
  email: { type: 'string', format: 'email', nullable: true },
};

const publicSubmitBody = {
  type: 'object',
  required: ['rating', 'textFr', 'textEn', 'nameFr', 'nameEn', 'roleFr', 'roleEn'],
  properties: coreProperties,
};

const adminCreateBody = {
  type: 'object',
  required: ['rating', 'textFr', 'textEn', 'nameFr', 'nameEn', 'roleFr', 'roleEn'],
  properties: {
    ...coreProperties,
    isPublished: { type: 'boolean' },
    status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
    sortOrder: { type: 'integer', minimum: 0 },
  },
};

module.exports = {
  '/api/v1/testimonials': {
    get: {
      tags: ['Testimonials'],
      summary: 'List testimonials',
      description:
        'Public list returns approved/published items. Authenticated admins may filter by ' +
        '`status` / `isPublished` and see the full moderation queue. Limit ≤ 100.',
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
        {
          name: 'status',
          in: 'query',
          schema: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
        },
        { name: 'isPublished', in: 'query', schema: { type: 'boolean' } },
      ],
      responses: {
        200: okContent(null, 'Testimonials list'),
        400: { $ref: '#/components/responses/BadRequest' },
      },
    },
    post: {
      tags: ['Testimonials'],
      summary: 'Create testimonial (admin)',
      description:
        'Requires `testimonial:create`. Prefer `/public` or `/feedback` for visitor submissions.',
      security: bearer,
      requestBody: {
        required: true,
        content: { 'application/json': { schema: adminCreateBody } },
      },
      responses: {
        201: okContent(null, 'Testimonial created'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
      },
    },
  },
  '/api/v1/testimonials/public': {
    post: {
      tags: ['Testimonials'],
      summary: 'Submit public testimonial',
      description: 'Unauthenticated feedback form. Creates a pending testimonial for moderation.',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: publicSubmitBody } },
      },
      responses: {
        201: okContent(null, 'Testimonial submitted'),
        400: { $ref: '#/components/responses/BadRequest' },
      },
    },
  },
  '/api/v1/testimonials/feedback': {
    post: {
      tags: ['Testimonials'],
      summary: 'Submit feedback (alias)',
      description: 'Same handler as `POST /testimonials/public`.',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: publicSubmitBody } },
      },
      responses: {
        201: okContent(null, 'Testimonial submitted'),
        400: { $ref: '#/components/responses/BadRequest' },
      },
    },
  },
  '/api/v1/testimonials/{testimonialId}': {
    get: {
      tags: ['Testimonials'],
      summary: 'Get testimonial by id',
      description: 'Requires `testimonial:read`.',
      security: bearer,
      parameters: [testimonialIdParam],
      responses: {
        200: okContent(null, 'Testimonial detail'),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    put: {
      tags: ['Testimonials'],
      summary: 'Update testimonial',
      description: 'Requires `testimonial:update:own` (owner) or `testimonial:update:any`.',
      security: bearer,
      parameters: [testimonialIdParam],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              minProperties: 1,
              properties: adminCreateBody.properties,
            },
          },
        },
      },
      responses: {
        200: okContent(null, 'Testimonial updated'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    delete: {
      tags: ['Testimonials'],
      summary: 'Soft-delete testimonial',
      description: 'Requires `testimonial:delete:own` (owner) or `testimonial:delete:any`.',
      security: bearer,
      parameters: [testimonialIdParam],
      responses: {
        200: okContent(null, 'Testimonial deleted'),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
  },
  '/api/v1/testimonials/{testimonialId}/approve': {
    patch: {
      tags: ['Testimonials'],
      summary: 'Approve testimonial',
      description: 'Requires `testimonial:update:any`.',
      security: bearer,
      parameters: [testimonialIdParam],
      responses: {
        200: okContent(null, 'Testimonial approved'),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
  },
  '/api/v1/testimonials/{testimonialId}/reject': {
    patch: {
      tags: ['Testimonials'],
      summary: 'Reject testimonial',
      description: 'Requires `testimonial:update:any`.',
      security: bearer,
      parameters: [testimonialIdParam],
      responses: {
        200: okContent(null, 'Testimonial rejected'),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
  },
};
