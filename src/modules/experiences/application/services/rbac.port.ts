/**
 * Narrow RBAC port for Experience ownership elevation checks.
 */
export interface ExperienceRbacPort {
  hasAnyRole(userId: string, roles: string[]): Promise<boolean>;
}
