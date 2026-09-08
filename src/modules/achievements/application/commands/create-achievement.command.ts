import type { AuditPort } from '@/shared/infrastructure/audit';

import type { AchievementEntity } from '../../domain/entities/achievement.entity';
import type { AchievementRepositoryPort } from '../../domain/repositories/achievement.repository';
import type { CreateAchievementDto } from '../dto/achievement.dto';

export type CreateAchievementCommandDeps = {
  achievementRepository: AchievementRepositoryPort;
  audit?: AuditPort;
};

/**
 * Creates a Achievement owned by the authenticated actor.
 */
export class CreateAchievementCommand {
  constructor(private readonly deps: CreateAchievementCommandDeps) {}

  async execute(input: CreateAchievementDto): Promise<AchievementEntity> {
    const created = await this.deps.achievementRepository.create({
      iconKey: input.iconKey.trim(),
      value: input.value.trim(),
      labelFr: input.labelFr.trim(),
      labelEn: input.labelEn.trim(),
      sortOrder: input.sortOrder ?? 0,
      ownerId: input.ownerId,
    });

    await this.deps.audit?.record({
      actorId: input.ownerId,
      action: 'achievement.create',
      resource: 'achievement',
      resourceId: created.id,
    });

    return created;
  }
}
