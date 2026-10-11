import { Client as Minio } from 'minio';

import { envs } from '@/app/config';
import log from '@/shared/infrastructure/logging/logger';
import { parseObjectStorageEndpoint } from '@/shared/infrastructure/storage/parse-object-storage-endpoint';

const parsed = parseObjectStorageEndpoint(envs.MINIO_ENDPOINT || 'localhost', {
  port: envs.MINIO_PORT ? Number(envs.MINIO_PORT) : 9000,
  useSSL: envs.MINIO_USE_SSL,
});

const minioConfig = {
  endPoint: parsed.endPoint,
  port: parsed.port ?? 9000,
  useSSL: parsed.useSSL ?? false,
  accessKey: envs.MINIO_ACCESS_KEY!,
  secretKey: envs.MINIO_SECRET_KEY!,
};

log.info('Initializing MinIO client', {
  endPoint: minioConfig.endPoint,
  port: minioConfig.port,
  useSSL: minioConfig.useSSL,
  accessKey: minioConfig.accessKey?.substring(0, 4) + '***',
});

/** Server-side put/get — may be an internal Docker hostname (e.g. seaweed-s3). */
export const minioClient = new Minio(minioConfig);

/**
 * Browser-facing presigns must be signed for the public gateway host.
 * Internal endpoints (seaweed-s3:8333) are unreachable from the browser and
 * blocked by CSP — keep MINIO_ENDPOINT internal for API↔storage, and
 * MINIO_PUBLIC_URL as the public S3 gateway (e.g. https://s3.zenora360.com).
 */
function buildPublicPresignClient(): Minio {
  const publicRaw = (envs.MINIO_PUBLIC_URL || '').trim();
  if (!publicRaw) return minioClient;

  const publicParsed = parseObjectStorageEndpoint(publicRaw, {
    port: 443,
    useSSL: true,
  });

  if (
    publicParsed.endPoint === minioConfig.endPoint &&
    (publicParsed.port ?? 443) === minioConfig.port &&
    Boolean(publicParsed.useSSL) === Boolean(minioConfig.useSSL)
  ) {
    return minioClient;
  }

  log.info('Initializing MinIO public presign client', {
    endPoint: publicParsed.endPoint,
    port: publicParsed.port ?? 443,
    useSSL: publicParsed.useSSL ?? true,
  });

  return new Minio({
    endPoint: publicParsed.endPoint,
    port: publicParsed.port ?? 443,
    useSSL: publicParsed.useSSL ?? true,
    accessKey: envs.MINIO_ACCESS_KEY!,
    secretKey: envs.MINIO_SECRET_KEY!,
  });
}

export const minioPublicPresignClient = buildPublicPresignClient();
