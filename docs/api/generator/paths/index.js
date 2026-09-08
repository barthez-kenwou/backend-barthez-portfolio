/**
 * Merge domain path objects. Order matches the historical monolith
 * (files between audit and /admin/queues) so generated YAML stays stable.
 */
const auth = require('./auth');
const oauth = require('./oauth');
const users = require('./users');
const blogs = require('./blogs');
const newsletter = require('./newsletter');
const files = require('./files');
const cv = require('./cv');
const contactResponses = require('./contact-responses');
const contactInfos = require('./contact-infos');
const education = require('./education');
const languages = require('./languages');
const references = require('./references');
const achievements = require('./achievements');
const testimonials = require('./testimonials');
const certifications = require('./certifications');
const experiences = require('./experiences');
const skills = require('./skills');
const services = require('./services');
const projects = require('./projects');
const system = require('./system');

const adminQueues = system['/admin/queues'];
const systemWithoutQueues = { ...system };
delete systemWithoutQueues['/admin/queues'];

module.exports = {
  ...auth,
  ...oauth,
  ...users,
  ...blogs,
  ...newsletter,
  ...cv,
  ...contactResponses,
  ...contactInfos,
  ...education,
  ...languages,
  ...references,
  ...achievements,
  ...testimonials,
  ...certifications,
  ...experiences,
  ...skills,
  ...services,
  ...projects,
  ...systemWithoutQueues,
  ...files,
  '/admin/queues': adminQueues,
};
