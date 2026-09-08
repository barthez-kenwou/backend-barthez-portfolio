/**
 * CV paths — /api/v1/cv
 * Public aggregate for the resume page / PDF.
 */
const { okContent } = require('../helpers');

module.exports = {
  '/api/v1/cv': {
    get: {
      tags: ['CV'],
      summary: 'Get public CV aggregate',
      description:
        'Read-only aggregate of contact info, experiences, education, skills, ' +
        'featured published projects (confidential links redacted), certifications, ' +
        'languages, and references. Soft-delete aware. No authentication required.',
      responses: {
        200: okContent(null, 'CV aggregate'),
        500: { $ref: '#/components/responses/ServerError' },
      },
    },
  },
};
