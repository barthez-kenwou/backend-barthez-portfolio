import type { ReferenceRbacPort } from '../../application/services/rbac.port';

/**
 * Default adapters bridging shared RBAC into Reference ports.
 */
export const createReferenceRbacAdapter = (): ReferenceRbacPort => ({
  async hasAnyRole(userId: string, roles: string[]): Promise<boolean> {
    const { rbacService } = await import('@/modules/rbac');
    return rbacService.hasAnyRole(userId, roles);
  },
});
