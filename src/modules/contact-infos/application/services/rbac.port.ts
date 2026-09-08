/**
 * Narrow RBAC port for Contact Info ownership elevation checks.
 */
export interface ContactInfoRbacPort {
  hasAnyRole(userId: string, roles: string[]): Promise<boolean>;
}
