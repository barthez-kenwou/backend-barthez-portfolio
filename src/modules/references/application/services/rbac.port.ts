/**
 * Narrow RBAC port for Reference ownership elevation checks.
 */
export interface ReferenceRbacPort {
  hasAnyRole(userId: string, roles: string[]): Promise<boolean>;
}
