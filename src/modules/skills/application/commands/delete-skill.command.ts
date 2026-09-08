import type { AuditPort } from '@/shared/infrastructure/audit';

import { SkillForbiddenError, SkillNotFoundError } from '../../domain/errors/skill.errors';
import type { SkillRepositoryPort } from '../../domain/repositories/skill.repository';
import type { DeleteSkillDto } from '../dto/skill.dto';

export type DeleteSkillCommandDeps = {
  skillRepository: SkillRepositoryPort;
  audit?: AuditPort;
};

/**
 * Soft-deletes a Skill. Owner or admin (`:any`) may delete.
 */
export class DeleteSkillCommand {
  constructor(private readonly deps: DeleteSkillCommandDeps) {}

  async execute(input: DeleteSkillDto): Promise<void> {
    const existing = await this.deps.skillRepository.findById(input.id);
    if (!existing) {
      throw new SkillNotFoundError();
    }

    if (!input.isAdmin && existing.ownerId !== input.actorId) {
      throw new SkillForbiddenError();
    }

    await this.deps.skillRepository.update(input.id, { deletedAt: new Date() });
    await this.deps.audit?.record({
      actorId: input.actorId,
      action: 'skill.delete',
      resource: 'skill',
      resourceId: input.id,
    });
  }
}
