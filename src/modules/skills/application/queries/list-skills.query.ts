import type { SkillListResult } from '../../domain/entities/skill.entity';
import type { SkillRepositoryPort } from '../../domain/repositories/skill.repository';
import type { ListSkillsDto } from '../dto/skill.dto';

export type ListSkillsQueryDeps = {
  skillRepository: SkillRepositoryPort;
};

/**
 * Paginated list of non-deleted Skills.
 */
export class ListSkillsQuery {
  constructor(private readonly deps: ListSkillsQueryDeps) {}

  async execute(input: ListSkillsDto): Promise<SkillListResult> {
    const page = Math.max(1, input.page);
    const limit = Math.min(100, Math.max(1, input.limit));
    return this.deps.skillRepository.list(page, limit);
  }
}
