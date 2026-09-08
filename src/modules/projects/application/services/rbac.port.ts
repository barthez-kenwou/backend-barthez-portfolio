/**
 * Narrow RBAC port for Project ownership elevation checks.
 */
export interface ProjectRbacPort {
  hasAnyRole(userId: string, roles: string[]): Promise<boolean>;
}
