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

export const minioClient = new Minio(minioConfig);
