import type { ContactResponseRbacPort } from '../../application/services/rbac.port';

/**
 * Default adapters bridging shared RBAC into Contact Response ports.
 */
export const createContactResponseRbacAdapter = (): ContactResponseRbacPort => ({
  async hasAnyRole(userId: string, roles: string[]): Promise<boolean> {
    const { rbacService } = await import('@/modules/rbac');
    return rbacService.hasAnyRole(userId, roles);
  },
});
