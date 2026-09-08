import type { SkillEntity } from '../../domain/entities/skill.entity';
import { SkillNotFoundError } from '../../domain/errors/skill.errors';
import type { SkillRepositoryPort } from '../../domain/repositories/skill.repository';
import type { GetSkillDto } from '../dto/skill.dto';

export type GetSkillQueryDeps = {
  skillRepository: SkillRepositoryPort;
};

/**
 * Fetches a single non-deleted Skill by id.
 */
export class GetSkillQuery {
  constructor(private readonly deps: GetSkillQueryDeps) {}

  async execute(input: GetSkillDto): Promise<SkillEntity> {
    const item = await this.deps.skillRepository.findById(input.id);
    if (!item) {
      throw new SkillNotFoundError();
    }
    return item;
  }
}
