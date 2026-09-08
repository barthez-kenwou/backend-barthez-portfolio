/**
 * Narrow RBAC port for Education ownership elevation checks.
 */
export interface EducationRbacPort {
  hasAnyRole(userId: string, roles: string[]): Promise<boolean>;
}
