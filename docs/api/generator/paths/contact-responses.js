/**
 * Contact Responses paths — /api/v1/contact-responses
 * Public contact form POST; admin inbox for list/detail/update/delete.
 */
const { okContent, bearer, mongoObjectId } = require('../helpers');

const contactResponseIdParam = {
  name: 'contactResponseId',
  in: 'path',
  required: true,
  schema: mongoObjectId,
};

const submitBody = {
  type: 'object',
  required: ['name', 'email', 'subject', 'message'],
  properties: {
    name: { type: 'string', maxLength: 200 },
    email: { type: 'string', format: 'email' },
    subject: { type: 'string', maxLength: 300 },
    message: { type: 'string', maxLength: 10000 },
  },
};

const updateBody = {
  type: 'object',
  minProperties: 1,
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 200 },
    email: { type: 'string', format: 'email' },
    subject: { type: 'string', minLength: 1, maxLength: 300 },
    message: { type: 'string', minLength: 1, maxLength: 10000 },
    status: { type: 'string', enum: ['new', 'read', 'archived', 'replied'] },
    notes: { type: 'string', nullable: true, maxLength: 5000 },
  },
};

module.exports = {
  '/api/v1/contact-responses': {
    post: {
      tags: ['ContactResponses'],
      summary: 'Submit contact form',
      description: 'Public unauthenticated contact-form submission.',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: submitBody } },
      },
      responses: {
        201: okContent(null, 'Contact message submitted'),
        400: { $ref: '#/components/responses/BadRequest' },
      },
    },
    get: {
      tags: ['ContactResponses'],
      summary: 'List contact responses',
      description:
        'Admin inbox. Requires `contact_response:read`. Optional `status` filter. Limit ≤ 100.',
      security: bearer,
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
          schema: { type: 'string', enum: ['new', 'read', 'archived', 'replied'] },
        },
      ],
      responses: {
        200: okContent(null, 'Contact responses list'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
      },
    },
  },
  '/api/v1/contact-responses/{contactResponseId}': {
    get: {
      tags: ['ContactResponses'],
      summary: 'Get contact response by id',
      description:
        'Requires `contact_response:read`. Viewing a `new` message auto-marks it as `read`.',
      security: bearer,
      parameters: [contactResponseIdParam],
      responses: {
        200: okContent(null, 'Contact response detail'),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    patch: {
      tags: ['ContactResponses'],
      summary: 'Update contact response',
      description: 'Requires `contact_response:update:own` or `contact_response:update:any`.',
      security: bearer,
      parameters: [contactResponseIdParam],
      requestBody: {
        required: false,
        content: { 'application/json': { schema: updateBody } },
      },
      responses: {
        200: okContent(null, 'Contact response updated'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    put: {
      tags: ['ContactResponses'],
      summary: 'Update contact response (PUT)',
      description: 'Same as PATCH. Requires `contact_response:update:own` or `:any`.',
      security: bearer,
      parameters: [contactResponseIdParam],
      requestBody: {
        required: false,
        content: { 'application/json': { schema: updateBody } },
      },
      responses: {
        200: okContent(null, 'Contact response updated'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    delete: {
      tags: ['ContactResponses'],
      summary: 'Soft-delete contact response',
      description: 'Requires `contact_response:delete:own` or `contact_response:delete:any`.',
      security: bearer,
      parameters: [contactResponseIdParam],
      responses: {
        200: okContent(null, 'Contact response deleted'),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
  },
};
