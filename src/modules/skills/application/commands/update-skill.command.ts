import type { AuditPort } from '@/shared/infrastructure/audit';

import type { SkillEntity } from '../../domain/entities/skill.entity';
import { SkillForbiddenError, SkillNotFoundError } from '../../domain/errors/skill.errors';
import type { SkillRepositoryPort } from '../../domain/repositories/skill.repository';
import type { UpdateSkillDto } from '../dto/skill.dto';

export type UpdateSkillCommandDeps = {
  skillRepository: SkillRepositoryPort;
  audit?: AuditPort;
};

/**
 * Updates a Skill. Owner or admin may mutate (admins bypass ownership).
 */
export class UpdateSkillCommand {
  constructor(private readonly deps: UpdateSkillCommandDeps) {}

  async execute(input: UpdateSkillDto): Promise<SkillEntity> {
    const existing = await this.deps.skillRepository.findById(input.id);
    if (!existing) {
      throw new SkillNotFoundError();
    }

    if (!input.isAdmin && existing.ownerId !== input.actorId) {
      throw new SkillForbiddenError();
    }

    const updated = await this.deps.skillRepository.update(input.id, {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.category !== undefined ? { category: input.category.trim() } : {}),
      ...(input.level !== undefined ? { level: input.level } : {}),
      ...(input.icon !== undefined ? { icon: input.icon.trim() } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    });

    await this.deps.audit?.record({
      actorId: input.actorId,
      action: 'skill.update',
      resource: 'skill',
      resourceId: input.id,
    });

    return updated;
  }
}
