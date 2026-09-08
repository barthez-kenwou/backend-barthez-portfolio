import type { AchievementEntity } from '../../domain/entities/achievement.entity';
import { AchievementNotFoundError } from '../../domain/errors/achievement.errors';
import type { AchievementRepositoryPort } from '../../domain/repositories/achievement.repository';
import type { GetAchievementDto } from '../dto/achievement.dto';

export type GetAchievementQueryDeps = {
  achievementRepository: AchievementRepositoryPort;
};

/**
 * Fetches a single non-deleted Achievement by id.
 */
export class GetAchievementQuery {
  constructor(private readonly deps: GetAchievementQueryDeps) {}

  async execute(input: GetAchievementDto): Promise<AchievementEntity> {
    const item = await this.deps.achievementRepository.findById(input.id);
    if (!item) {
      throw new AchievementNotFoundError();
    }
    return item;
  }
}
