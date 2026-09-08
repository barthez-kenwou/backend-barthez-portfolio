/**
 * Narrow RBAC port for Service ownership elevation checks.
 */
export interface ServiceRbacPort {
  hasAnyRole(userId: string, roles: string[]): Promise<boolean>;
}
