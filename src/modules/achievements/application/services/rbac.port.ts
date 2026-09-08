/**
 * Narrow RBAC port for Achievement ownership elevation checks.
 */
export interface AchievementRbacPort {
  hasAnyRole(userId: string, roles: string[]): Promise<boolean>;
}
