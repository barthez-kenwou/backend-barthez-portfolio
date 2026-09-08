import type { CreateProjectInput, UpdateProjectInput } from '../../domain/entities/project.entity';

export type CreateProjectDto = Omit<CreateProjectInput, 'ownerId'> & {
  ownerId: string;
};

export type UpdateProjectDto = UpdateProjectInput & {
  id: string;
  actorId: string;
  isAdmin: boolean;
};

export type DeleteProjectDto = {
  id: string;
  actorId: string;
  isAdmin: boolean;
};

export type GetProjectDto = {
  id: string;
  /** When false, unpublished projects are hidden (404). */
  allowUnpublished?: boolean;
};

export type ListProjectsDto = {
  page: number;
  limit: number;
  isPublished?: boolean;
  isFeatured?: boolean;
  category?: string;
  /** When true, caller must be authenticated with project:read. */
  includeUnpublished?: boolean;
};
