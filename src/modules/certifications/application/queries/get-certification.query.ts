import type { CertificationEntity } from '../../domain/entities/certification.entity';
import { CertificationNotFoundError } from '../../domain/errors/certification.errors';
import type { CertificationRepositoryPort } from '../../domain/repositories/certification.repository';
import type { GetCertificationDto } from '../dto/certification.dto';

export type GetCertificationQueryDeps = {
  certificationRepository: CertificationRepositoryPort;
};

/**
 * Fetches a single non-deleted Certification by id.
 */
export class GetCertificationQuery {
  constructor(private readonly deps: GetCertificationQueryDeps) {}

  async execute(input: GetCertificationDto): Promise<CertificationEntity> {
    const item = await this.deps.certificationRepository.findById(input.id);
    if (!item) {
      throw new CertificationNotFoundError();
    }
    return item;
  }
}
