/**
 * Narrow RBAC port for Skill ownership elevation checks.
 */
export interface SkillRbacPort {
  hasAnyRole(userId: string, roles: string[]): Promise<boolean>;
}
