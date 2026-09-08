import type {
  CreateProjectInput,
  ProjectEntity,
  ProjectListFilters,
  ProjectListResult,
  UpdateProjectInput,
} from '../entities/project.entity';

/**
 * Port for Project persistence required by use cases.
 */
export interface ProjectRepositoryPort {
  create(data: CreateProjectInput): Promise<ProjectEntity>;
  findById(id: string): Promise<ProjectEntity | null>;
  list(filters: ProjectListFilters): Promise<ProjectListResult>;
  update(id: string, data: UpdateProjectInput): Promise<ProjectEntity>;
}
