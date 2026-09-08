/**
 * Narrow RBAC port for Certification ownership elevation checks.
 */
export interface CertificationRbacPort {
  hasAnyRole(userId: string, roles: string[]): Promise<boolean>;
}
