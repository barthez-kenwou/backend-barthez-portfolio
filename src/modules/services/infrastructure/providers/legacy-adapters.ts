import type { ServiceRbacPort } from '../../application/services/rbac.port';

/**
 * Default adapters bridging shared RBAC into Service ports.
 */
export const createServiceRbacAdapter = (): ServiceRbacPort => ({
  async hasAnyRole(userId: string, roles: string[]): Promise<boolean> {
    const { rbacService } = await import('@/modules/rbac');
    return rbacService.hasAnyRole(userId, roles);
  },
});
