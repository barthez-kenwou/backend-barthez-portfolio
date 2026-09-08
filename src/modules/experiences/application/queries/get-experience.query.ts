import type { ExperienceEntity } from '../../domain/entities/experience.entity';
import { ExperienceNotFoundError } from '../../domain/errors/experience.errors';
import type { ExperienceRepositoryPort } from '../../domain/repositories/experience.repository';
import type { GetExperienceDto } from '../dto/experience.dto';

export type GetExperienceQueryDeps = {
  experienceRepository: ExperienceRepositoryPort;
};

/**
 * Fetches a single non-deleted Experience by id.
 */
export class GetExperienceQuery {
  constructor(private readonly deps: GetExperienceQueryDeps) {}

  async execute(input: GetExperienceDto): Promise<ExperienceEntity> {
    const item = await this.deps.experienceRepository.findById(input.id);
    if (!item) {
      throw new ExperienceNotFoundError();
    }
    return item;
  }
}
