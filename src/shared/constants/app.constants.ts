/**
 * Cross-cutting constants shared by multiple modules.
 * Keep this file thin — module-specific constants belong inside that module.
 */

/** Cookie names used by the auth presentation layer. */
export const AUTH_COOKIES = {
  REFRESH_TOKEN: 'refresh_token',
} as const;

/** Built-in role slugs seeded at bootstrap. */
export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest',
} as const;

/**
 * Built-in permission catalogue seeded at bootstrap.
 * Role/permission CRUD APIs are not shipped — those names are omitted so the
 * catalogue matches enforced routes. `blog:read` remains for guest seed only
 * (public list/search do not require it).
 */
export const SYSTEM_PERMISSIONS = [
  { name: 'user:read:any', resource: 'user', action: 'read:any' },
  { name: 'user:update:any', resource: 'user', action: 'update:any' },
  { name: 'user:delete:any', resource: 'user', action: 'delete:any' },
  { name: 'user:export', resource: 'user', action: 'export' },
  { name: 'user:role:assign', resource: 'user', action: 'role:assign' },
  { name: 'blog:read', resource: 'blog', action: 'read' },
  { name: 'blog:create', resource: 'blog', action: 'create' },
  { name: 'blog:update:own', resource: 'blog', action: 'update:own' },
  { name: 'blog:update:any', resource: 'blog', action: 'update:any' },
  { name: 'blog:delete:own', resource: 'blog', action: 'delete:own' },
  { name: 'blog:delete:any', resource: 'blog', action: 'delete:any' },
  { name: 'blog:publish', resource: 'blog', action: 'publish' },
  { name: 'project:read', resource: 'project', action: 'read' },
  { name: 'project:create', resource: 'project', action: 'create' },
  { name: 'project:update:own', resource: 'project', action: 'update:own' },
  { name: 'project:update:any', resource: 'project', action: 'update:any' },
  { name: 'project:delete:own', resource: 'project', action: 'delete:own' },
  { name: 'project:delete:any', resource: 'project', action: 'delete:any' },
  { name: 'service:read', resource: 'service', action: 'read' },
  { name: 'service:create', resource: 'service', action: 'create' },
  { name: 'service:update:own', resource: 'service', action: 'update:own' },
  { name: 'service:update:any', resource: 'service', action: 'update:any' },
  { name: 'service:delete:own', resource: 'service', action: 'delete:own' },
  { name: 'service:delete:any', resource: 'service', action: 'delete:any' },
  { name: 'skill:read', resource: 'skill', action: 'read' },
  { name: 'skill:create', resource: 'skill', action: 'create' },
  { name: 'skill:update:own', resource: 'skill', action: 'update:own' },
  { name: 'skill:update:any', resource: 'skill', action: 'update:any' },
  { name: 'skill:delete:own', resource: 'skill', action: 'delete:own' },
  { name: 'skill:delete:any', resource: 'skill', action: 'delete:any' },
  { name: 'experience:read', resource: 'experience', action: 'read' },
  { name: 'experience:create', resource: 'experience', action: 'create' },
  { name: 'experience:update:own', resource: 'experience', action: 'update:own' },
  { name: 'experience:update:any', resource: 'experience', action: 'update:any' },
  { name: 'experience:delete:own', resource: 'experience', action: 'delete:own' },
  { name: 'experience:delete:any', resource: 'experience', action: 'delete:any' },
  { name: 'certification:read', resource: 'certification', action: 'read' },
  { name: 'certification:create', resource: 'certification', action: 'create' },
  { name: 'certification:update:own', resource: 'certification', action: 'update:own' },
  { name: 'certification:update:any', resource: 'certification', action: 'update:any' },
  { name: 'certification:delete:own', resource: 'certification', action: 'delete:own' },
  { name: 'certification:delete:any', resource: 'certification', action: 'delete:any' },
  { name: 'testimonial:read', resource: 'testimonial', action: 'read' },
  { name: 'testimonial:create', resource: 'testimonial', action: 'create' },
  { name: 'testimonial:update:own', resource: 'testimonial', action: 'update:own' },
  { name: 'testimonial:update:any', resource: 'testimonial', action: 'update:any' },
  { name: 'testimonial:delete:own', resource: 'testimonial', action: 'delete:own' },
  { name: 'testimonial:delete:any', resource: 'testimonial', action: 'delete:any' },
  { name: 'achievement:read', resource: 'achievement', action: 'read' },
  { name: 'achievement:create', resource: 'achievement', action: 'create' },
  { name: 'achievement:update:own', resource: 'achievement', action: 'update:own' },
  { name: 'achievement:update:any', resource: 'achievement', action: 'update:any' },
  { name: 'achievement:delete:own', resource: 'achievement', action: 'delete:own' },
  { name: 'achievement:delete:any', resource: 'achievement', action: 'delete:any' },
  { name: 'reference:read', resource: 'reference', action: 'read' },
  { name: 'reference:create', resource: 'reference', action: 'create' },
  { name: 'reference:update:own', resource: 'reference', action: 'update:own' },
  { name: 'reference:update:any', resource: 'reference', action: 'update:any' },
  { name: 'reference:delete:own', resource: 'reference', action: 'delete:own' },
  { name: 'reference:delete:any', resource: 'reference', action: 'delete:any' },
  { name: 'language:read', resource: 'language', action: 'read' },
  { name: 'language:create', resource: 'language', action: 'create' },
  { name: 'language:update:own', resource: 'language', action: 'update:own' },
  { name: 'language:update:any', resource: 'language', action: 'update:any' },
  { name: 'language:delete:own', resource: 'language', action: 'delete:own' },
  { name: 'language:delete:any', resource: 'language', action: 'delete:any' },
  { name: 'education:read', resource: 'education', action: 'read' },
  { name: 'education:create', resource: 'education', action: 'create' },
  { name: 'education:update:own', resource: 'education', action: 'update:own' },
  { name: 'education:update:any', resource: 'education', action: 'update:any' },
  { name: 'education:delete:own', resource: 'education', action: 'delete:own' },
  { name: 'education:delete:any', resource: 'education', action: 'delete:any' },
  { name: 'contact_info:read', resource: 'contact_info', action: 'read' },
  { name: 'contact_info:create', resource: 'contact_info', action: 'create' },
  { name: 'contact_info:update:own', resource: 'contact_info', action: 'update:own' },
  { name: 'contact_info:update:any', resource: 'contact_info', action: 'update:any' },
  { name: 'contact_info:delete:own', resource: 'contact_info', action: 'delete:own' },
  { name: 'contact_info:delete:any', resource: 'contact_info', action: 'delete:any' },
  { name: 'contact_response:read', resource: 'contact_response', action: 'read' },
  { name: 'contact_response:create', resource: 'contact_response', action: 'create' },
  { name: 'contact_response:update:own', resource: 'contact_response', action: 'update:own' },
  { name: 'contact_response:update:any', resource: 'contact_response', action: 'update:any' },
  { name: 'contact_response:delete:own', resource: 'contact_response', action: 'delete:own' },
  { name: 'contact_response:delete:any', resource: 'contact_response', action: 'delete:any' },
  { name: 'audit:read', resource: 'audit', action: 'read' },
] as const;

/**
 * Logical storage bucket *defaults*. Runtime names come from
 * `config.storage.minio.appBucket` / `backupBucket` (MINIO_*_BUCKET env).
 */
export const STORAGE_BUCKETS = {
  UPLOADS: 'app-uploads',
  BACKUPS: 'backups',
} as const;

/** Object-key prefixes inside the uploads bucket. */
export const STORAGE_PATHS = {
  USER_AVATARS: 'users/avatars',
} as const;

/** BullMQ queue names. */
export const QUEUE_NAMES = {
  MAIL: 'mail',
  BACKUP: 'backup',
  MAINTENANCE: 'maintenance',
  HEAVY_TASKS: 'heavy-tasks',
} as const;
