import type {
  CreateEducationInput,
  EducationEntity,
  EducationListResult,
  UpdateEducationInput,
} from '../entities/education.entity';

/**
 * Port for Education persistence required by use cases.
 * Infrastructure provides a Prisma implementation.
 */
export interface EducationRepositoryPort {
  create(data: CreateEducationInput): Promise<EducationEntity>;
  findById(id: string): Promise<EducationEntity | null>;
  list(page: number, limit: number): Promise<EducationListResult>;
  update(id: string, data: UpdateEducationInput): Promise<EducationEntity>;
}
