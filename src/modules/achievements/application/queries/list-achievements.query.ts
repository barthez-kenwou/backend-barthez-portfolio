import type { AchievementListResult } from '../../domain/entities/achievement.entity';
import type { AchievementRepositoryPort } from '../../domain/repositories/achievement.repository';
import type { ListAchievementsDto } from '../dto/achievement.dto';

export type ListAchievementsQueryDeps = {
  achievementRepository: AchievementRepositoryPort;
};

/**
 * Paginated list of non-deleted Achievements.
 */
export class ListAchievementsQuery {
  constructor(private readonly deps: ListAchievementsQueryDeps) {}

  async execute(input: ListAchievementsDto): Promise<AchievementListResult> {
    const page = Math.max(1, input.page);
    const limit = Math.min(100, Math.max(1, input.limit));
    return this.deps.achievementRepository.list(page, limit);
  }
}
