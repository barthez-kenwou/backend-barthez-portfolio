import { describe, expect, it } from 'vitest';

import { parseObjectStorageEndpoint } from '@/shared/infrastructure/storage/parse-object-storage-endpoint';

describe('parseObjectStorageEndpoint', () => {
  const defaults = { port: 8333, useSSL: false };

  it('keeps a bare hostname and env defaults', () => {
    expect(parseObjectStorageEndpoint('s3.zenora360.com', defaults)).toEqual({
      endPoint: 's3.zenora360.com',
      port: 8333,
      useSSL: false,
    });
  });

  it('strips https URL scheme and enables SSL', () => {
    expect(parseObjectStorageEndpoint('https://s3.zenora360.com/', defaults)).toEqual({
      endPoint: 's3.zenora360.com',
      port: 443,
      useSSL: true,
    });
  });

  it('honours explicit port in URL', () => {
    expect(parseObjectStorageEndpoint('https://s3.zenora360.com:8333', defaults)).toEqual({
      endPoint: 's3.zenora360.com',
      port: 8333,
      useSSL: true,
    });
  });

  it('parses host:port without scheme', () => {
    expect(parseObjectStorageEndpoint('s3.zenora360.com:8333', defaults)).toEqual({
      endPoint: 's3.zenora360.com',
      port: 8333,
      useSSL: false,
    });
  });
});
