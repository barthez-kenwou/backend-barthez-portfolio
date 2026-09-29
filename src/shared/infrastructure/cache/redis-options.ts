import type { RedisOptions } from 'ioredis';

import { config } from '@/app/config';

/**
 * Single Redis option builder for cache, locks, rate-limit, and BullMQ.
 */
export const buildRedisOptions = (overrides: Partial<RedisOptions> = {}): RedisOptions => {
  const password = config.redis.password || undefined;
  // Redis 6 ACL AUTH(username, password) fails if username is set without a real password
  // (Compose Redis has no AUTH). Only send username when password is also set.
  const username = password ? config.redis.username || undefined : undefined;

  const options: RedisOptions = {
    host: config.redis.host,
    port: config.redis.port,
    db: config.redis.db,
    username,
    password,
    connectTimeout: 10_000,
    maxRetriesPerRequest: 5,
    ...overrides,
  };

  if (config.redis.tls) {
    options.tls = {
      rejectUnauthorized: config.redis.tlsRejectUnauthorized,
    };
  }

  return options;
};
