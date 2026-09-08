import type { ContactInfoRbacPort } from '../../application/services/rbac.port';

/**
 * Default adapters bridging shared RBAC into Contact Info ports.
 */
export const createContactInfoRbacAdapter = (): ContactInfoRbacPort => ({
  async hasAnyRole(userId: string, roles: string[]): Promise<boolean> {
    const { rbacService } = await import('@/modules/rbac');
    return rbacService.hasAnyRole(userId, roles);
  },
});
