import type { AuditPort } from '@/shared/infrastructure/audit';

import type { AchievementEntity } from '../../domain/entities/achievement.entity';
import {
  AchievementForbiddenError,
  AchievementNotFoundError,
} from '../../domain/errors/achievement.errors';
import type { AchievementRepositoryPort } from '../../domain/repositories/achievement.repository';
import type { UpdateAchievementDto } from '../dto/achievement.dto';

export type UpdateAchievementCommandDeps = {
  achievementRepository: AchievementRepositoryPort;
  audit?: AuditPort;
};

/**
 * Updates a Achievement. Owner or admin may mutate (admins bypass ownership).
 */
export class UpdateAchievementCommand {
  constructor(private readonly deps: UpdateAchievementCommandDeps) {}

  async execute(input: UpdateAchievementDto): Promise<AchievementEntity> {
    const existing = await this.deps.achievementRepository.findById(input.id);
    if (!existing) {
      throw new AchievementNotFoundError();
    }

    if (!input.isAdmin && existing.ownerId !== input.actorId) {
      throw new AchievementForbiddenError();
    }

    const updated = await this.deps.achievementRepository.update(input.id, {
      ...(input.iconKey !== undefined ? { iconKey: input.iconKey.trim() } : {}),
      ...(input.value !== undefined ? { value: input.value.trim() } : {}),
      ...(input.labelFr !== undefined ? { labelFr: input.labelFr.trim() } : {}),
      ...(input.labelEn !== undefined ? { labelEn: input.labelEn.trim() } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    });

    await this.deps.audit?.record({
      actorId: input.actorId,
      action: 'achievement.update',
      resource: 'achievement',
      resourceId: input.id,
    });

    return updated;
  }
}
