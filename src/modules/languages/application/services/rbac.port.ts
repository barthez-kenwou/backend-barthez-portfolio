/**
 * Narrow RBAC port for Language ownership elevation checks.
 */
export interface LanguageRbacPort {
  hasAnyRole(userId: string, roles: string[]): Promise<boolean>;
}
