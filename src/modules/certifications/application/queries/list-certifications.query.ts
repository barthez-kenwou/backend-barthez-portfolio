import type { CertificationListResult } from '../../domain/entities/certification.entity';
import type { CertificationRepositoryPort } from '../../domain/repositories/certification.repository';
import type { ListCertificationsDto } from '../dto/certification.dto';

export type ListCertificationsQueryDeps = {
  certificationRepository: CertificationRepositoryPort;
};

/**
 * Paginated list of non-deleted Certifications.
 */
export class ListCertificationsQuery {
  constructor(private readonly deps: ListCertificationsQueryDeps) {}

  async execute(input: ListCertificationsDto): Promise<CertificationListResult> {
    const page = Math.max(1, input.page);
    const limit = Math.min(100, Math.max(1, input.limit));
    return this.deps.certificationRepository.list(page, limit);
  }
}
