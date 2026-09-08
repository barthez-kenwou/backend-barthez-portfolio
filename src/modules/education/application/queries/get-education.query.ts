import type { EducationEntity } from '../../domain/entities/education.entity';
import { EducationNotFoundError } from '../../domain/errors/education.errors';
import type { EducationRepositoryPort } from '../../domain/repositories/education.repository';
import type { GetEducationDto } from '../dto/education.dto';

export type GetEducationQueryDeps = {
  educationRepository: EducationRepositoryPort;
};

/**
 * Fetches a single non-deleted Education by id.
 */
export class GetEducationQuery {
  constructor(private readonly deps: GetEducationQueryDeps) {}

  async execute(input: GetEducationDto): Promise<EducationEntity> {
    const item = await this.deps.educationRepository.findById(input.id);
    if (!item) {
      throw new EducationNotFoundError();
    }
    return item;
  }
}
