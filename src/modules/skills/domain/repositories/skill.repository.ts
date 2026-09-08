import type {
  CreateSkillInput,
  SkillEntity,
  SkillListResult,
  UpdateSkillInput,
} from '../entities/skill.entity';

/**
 * Port for Skill persistence required by use cases.
 * Infrastructure provides a Prisma implementation.
 */
export interface SkillRepositoryPort {
  create(data: CreateSkillInput): Promise<SkillEntity>;
  findById(id: string): Promise<SkillEntity | null>;
  list(page: number, limit: number): Promise<SkillListResult>;
  update(id: string, data: UpdateSkillInput): Promise<SkillEntity>;
}
