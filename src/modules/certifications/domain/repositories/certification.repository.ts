import type {
  CertificationEntity,
  CertificationListResult,
  CreateCertificationInput,
  UpdateCertificationInput,
} from '../entities/certification.entity';

/**
 * Port for Certification persistence required by use cases.
 * Infrastructure provides a Prisma implementation.
 */
export interface CertificationRepositoryPort {
  create(data: CreateCertificationInput): Promise<CertificationEntity>;
  findById(id: string): Promise<CertificationEntity | null>;
  list(page: number, limit: number): Promise<CertificationListResult>;
  update(id: string, data: UpdateCertificationInput): Promise<CertificationEntity>;
}
