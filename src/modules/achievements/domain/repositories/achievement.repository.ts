import type {
  AchievementEntity,
  AchievementListResult,
  CreateAchievementInput,
  UpdateAchievementInput,
} from '../entities/achievement.entity';

/**
 * Port for Achievement persistence required by use cases.
 * Infrastructure provides a Prisma implementation.
 */
export interface AchievementRepositoryPort {
  create(data: CreateAchievementInput): Promise<AchievementEntity>;
  findById(id: string): Promise<AchievementEntity | null>;
  list(page: number, limit: number): Promise<AchievementListResult>;
  update(id: string, data: UpdateAchievementInput): Promise<AchievementEntity>;
}
