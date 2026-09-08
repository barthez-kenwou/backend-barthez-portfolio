/**
 * Contact Infos paths — /api/v1/contact-infos
 * Singleton public profile / contact card (GET public, PUT/DELETE admin).
 */
const { okContent, bearer } = require('../helpers');

const upsertBody = {
  type: 'object',
  required: [
    'name',
    'handle',
    'titleFr',
    'titleEn',
    'subtitleFr',
    'subtitleEn',
    'email',
    'phone',
    'whatsappLink',
    'location',
    'website',
    'repository',
    'github',
    'linkedin',
    'facebook',
  ],
  properties: {
    singletonKey: {
      type: 'string',
      minLength: 1,
      maxLength: 64,
      description: 'Defaults to "default" when omitted',
    },
    name: { type: 'string', maxLength: 200 },
    handle: { type: 'string', maxLength: 100 },
    titleFr: { type: 'string', maxLength: 300 },
    titleEn: { type: 'string', maxLength: 300 },
    subtitleFr: { type: 'string', maxLength: 500 },
    subtitleEn: { type: 'string', maxLength: 500 },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string', maxLength: 50 },
    whatsappLink: { type: 'string', maxLength: 500 },
    location: { type: 'string', maxLength: 200 },
    website: { type: 'string', maxLength: 500 },
    repository: { type: 'string', maxLength: 500 },
    github: { type: 'string', maxLength: 500 },
    linkedin: { type: 'string', maxLength: 500 },
    facebook: { type: 'string', maxLength: 500 },
    photoUrl: { type: 'string', nullable: true, maxLength: 1000 },
    yearsExperience: { type: 'integer', nullable: true, minimum: 0, maximum: 80 },
    tags: { type: 'array', items: { type: 'string', maxLength: 100 } },
  },
};

const keyQuery = {
  name: 'key',
  in: 'query',
  schema: { type: 'string', minLength: 1, maxLength: 64 },
  description: 'Singleton key (default "default")',
};

module.exports = {
  '/api/v1/contact-infos': {
    get: {
      tags: ['ContactInfos'],
      summary: 'Get contact info',
      description: 'Public singleton profile / contact card. Optional `?key=` (default "default").',
      parameters: [keyQuery],
      responses: {
        200: okContent(null, 'Contact info'),
        400: { $ref: '#/components/responses/BadRequest' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    put: {
      tags: ['ContactInfos'],
      summary: 'Upsert contact info',
      description: 'Admin upsert. Requires `contact_info:update:own` or `contact_info:update:any`.',
      security: bearer,
      requestBody: {
        required: true,
        content: { 'application/json': { schema: upsertBody } },
      },
      responses: {
        200: okContent(null, 'Contact info upserted'),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
      },
    },
    delete: {
      tags: ['ContactInfos'],
      summary: 'Soft-delete contact info',
      description: 'Requires `contact_info:delete:own` or `contact_info:delete:any`.',
      security: bearer,
      parameters: [keyQuery],
      responses: {
        200: okContent(null, 'Contact info deleted'),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
  },
};
