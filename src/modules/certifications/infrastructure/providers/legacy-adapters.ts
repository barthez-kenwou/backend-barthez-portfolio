import type { CertificationRbacPort } from '../../application/services/rbac.port';

/**
 * Default adapters bridging shared RBAC into Certification ports.
 */
export const createCertificationRbacAdapter = (): CertificationRbacPort => ({
  async hasAnyRole(userId: string, roles: string[]): Promise<boolean> {
    const { rbacService } = await import('@/modules/rbac');
    return rbacService.hasAnyRole(userId, roles);
  },
});
