import type {
  CreateExperienceInput,
  ExperienceEntity,
  ExperienceListResult,
  UpdateExperienceInput,
} from '../entities/experience.entity';

/**
 * Port for Experience persistence required by use cases.
 * Infrastructure provides a Prisma implementation.
 */
export interface ExperienceRepositoryPort {
  create(data: CreateExperienceInput): Promise<ExperienceEntity>;
  findById(id: string): Promise<ExperienceEntity | null>;
  list(page: number, limit: number): Promise<ExperienceListResult>;
  update(id: string, data: UpdateExperienceInput): Promise<ExperienceEntity>;
}
