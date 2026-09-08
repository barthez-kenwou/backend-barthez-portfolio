/**
 * Narrow RBAC port for Contact Response ownership elevation checks.
 */
export interface ContactResponseRbacPort {
  hasAnyRole(userId: string, roles: string[]): Promise<boolean>;
}
