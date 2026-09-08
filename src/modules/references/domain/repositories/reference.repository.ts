import type {
  CreateReferenceInput,
  ReferenceEntity,
  ReferenceListResult,
  UpdateReferenceInput,
} from '../entities/reference.entity';

/**
 * Port for Reference persistence required by use cases.
 * Infrastructure provides a Prisma implementation.
 */
export interface ReferenceRepositoryPort {
  create(data: CreateReferenceInput): Promise<ReferenceEntity>;
  findById(id: string): Promise<ReferenceEntity | null>;
  list(page: number, limit: number): Promise<ReferenceListResult>;
  update(id: string, data: UpdateReferenceInput): Promise<ReferenceEntity>;
}
