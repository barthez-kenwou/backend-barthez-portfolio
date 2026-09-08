import type { AuditPort } from '@/shared/infrastructure/audit';

import type { SkillEntity } from '../../domain/entities/skill.entity';
import type { SkillRepositoryPort } from '../../domain/repositories/skill.repository';
import type { CreateSkillDto } from '../dto/skill.dto';

export type CreateSkillCommandDeps = {
  skillRepository: SkillRepositoryPort;
  audit?: AuditPort;
};

/**
 * Creates a Skill owned by the authenticated actor.
 */
export class CreateSkillCommand {
  constructor(private readonly deps: CreateSkillCommandDeps) {}

  async execute(input: CreateSkillDto): Promise<SkillEntity> {
    const created = await this.deps.skillRepository.create({
      name: input.name.trim(),
      category: input.category.trim(),
      level: input.level,
      icon: input.icon.trim(),
      sortOrder: input.sortOrder ?? 0,
      ownerId: input.ownerId,
    });

    await this.deps.audit?.record({
      actorId: input.ownerId,
      action: 'skill.create',
      resource: 'skill',
      resourceId: created.id,
    });

    return created;
  }
}
