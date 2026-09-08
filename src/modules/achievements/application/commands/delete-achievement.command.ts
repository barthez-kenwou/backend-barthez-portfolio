import type { AuditPort } from '@/shared/infrastructure/audit';

import {
  AchievementForbiddenError,
  AchievementNotFoundError,
} from '../../domain/errors/achievement.errors';
import type { AchievementRepositoryPort } from '../../domain/repositories/achievement.repository';
import type { DeleteAchievementDto } from '../dto/achievement.dto';

export type DeleteAchievementCommandDeps = {
  achievementRepository: AchievementRepositoryPort;
  audit?: AuditPort;
};

/**
 * Soft-deletes a Achievement. Owner or admin (`:any`) may delete.
 */
export class DeleteAchievementCommand {
  constructor(private readonly deps: DeleteAchievementCommandDeps) {}

  async execute(input: DeleteAchievementDto): Promise<void> {
    const existing = await this.deps.achievementRepository.findById(input.id);
    if (!existing) {
      throw new AchievementNotFoundError();
    }

    if (!input.isAdmin && existing.ownerId !== input.actorId) {
      throw new AchievementForbiddenError();
    }

    await this.deps.achievementRepository.update(input.id, { deletedAt: new Date() });
    await this.deps.audit?.record({
      actorId: input.actorId,
      action: 'achievement.delete',
      resource: 'achievement',
      resourceId: input.id,
    });
  }
}
