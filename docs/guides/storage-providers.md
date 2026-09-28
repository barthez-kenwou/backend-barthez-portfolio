# Storage Providers

Object storage appears in two related places:

| Concern                                              | Location                          | Default                      |
| ---------------------------------------------------- | --------------------------------- | ---------------------------- |
| Shared storage (backups, bucket ensure, raw put/get) | `@/shared/infrastructure/storage` | MinIO via `STORAGE_PROVIDER` |
| Validated user uploads (avatars, documents)          | `@/modules/files`                 | `MinioUploader` + providers  |

## Important mental model

**MinIO the Docker service** ≠ **MinIO the protocol client**.

The Node SDKs talk **S3-compatible HTTP**. Locally that target is the Compose
`minio` container. In production it can be **SeaweedFS S3**, AWS S3, Garage, R2,
etc. — same env shape, different host/credentials.

Today, **avatar / presign uploads always read `MINIO_*`**. So for SeaweedFS,
fill `MINIO_*` with the Seaweed S3 gateway values (simplest path).  
`STORAGE_PROVIDER=s3` + `S3_*` mainly switches the **shared** storage facade
(backups / `storageService`); keep `MINIO_*` filled either way until files is
fully dual-wired.

## Shared storage — MinIO vs S3

Config section: `config.storage` (`src/app/config/sections/storage.ts`).

```bash
STORAGE_PROVIDER=minio   # default — fine even when the server is SeaweedFS
# or
STORAGE_PROVIDER=s3      # shared facade uses S3_* (falls back to MINIO_* if empty)
```

The facade in `storage.service.ts` selects:

- `MinioStorageProvider` when provider ≠ `s3`
- `S3StorageProvider` when `STORAGE_PROVIDER=s3`

### Local (Compose MinIO)

```bash
STORAGE_PROVIDER=minio
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minio123
MINIO_APP_BUCKET=app-uploads
MINIO_BACKUP_BUCKET=backups
MINIO_PUBLIC_URL=http://localhost:9000
```

### Production (SeaweedFS S3 gateway)

Do **not** start Compose MinIO. In `infra/docker/docker-compose.deploy.yml`,
MinIO is behind profile `bundled-storage` (off by default).

```bash
STORAGE_PROVIDER=minio
MINIO_ENDPOINT=<seaweed-s3-host>   # reachable FROM the API container
MINIO_PORT=8333                    # your S3 API port
MINIO_USE_SSL=false                # or true + TLS
MINIO_ACCESS_KEY=<identity>
MINIO_SECRET_KEY=<secret>
MINIO_APP_BUCKET=app-uploads
MINIO_BACKUP_BUCKET=backups
MINIO_PUBLIC_URL=https://files.example.com
```

Create the buckets in SeaweedFS (or let `ensureBuckets()` create them if your
gateway allows `CreateBucket`).

## Two upload paths

| Path                                                     | Use                       | Limit                                                                |
| -------------------------------------------------------- | ------------------------- | -------------------------------------------------------------------- |
| Multipart `upload.single('profile')` on signup / profile | Avatars                   | `API_UPLOAD_MAX_BYTES` (2MB). Nginx `client_max_body_size 2m`.       |
| `POST /api/v1/files/presign` then HTTP PUT to the URL    | Documents / large objects | `PRESIGN_UPLOAD_MAX_BYTES` (default 50MB), TTL `PRESIGN_TTL_SECONDS` |
| `GET /api/v1/files/presign?key=`                         | Time-limited download     | Auth + verified + active                                             |

Multipart is sniffed with `file-type` (magic bytes). The `avatar` profile allows
jpeg/png; the default profile allows jpeg/png/pdf.

## ClamAV

The files-module singleton uploader injects `ClamAVScanner` (skipped in tests).
Unreachable ClamAV **fails open** unless `CLAMAV_REQUIRED=true`, in which case
uploads are rejected.

Host/port: `config.storage.clamav`.

## Swapping upload backends

1. Implement `UploaderPort` (for example with the AWS SDK).
2. Pass it through `createDefaultFilesDeps({ uploader })` or wire it in the
   files module defaults.
3. Keep Multer at the HTTP edge for avatars; keep virus scanning recommended.

## When to use which

- **Backup module / ops dumps** → shared storage facade + `STORAGE_PROVIDER`.
- **Signup/profile avatars** → files module multipart + `UploadAvatarCommand`.
- **Large user files** → presign routes, not the API body.
- Do not duplicate bucket bootstrap logic inside domain modules.

## Related

- [Modules — files](../architecture/modules.md)
- Files README: `src/modules/files/README.md`
- [GitHub → VPS](../deployment/github-vps.md) (SeaweedFS on deploy compose)
- [Background jobs](./background-jobs.md) (backup uploads)
- [Backups](./backup.md)
