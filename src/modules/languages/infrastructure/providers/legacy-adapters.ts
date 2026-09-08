import type { LanguageRbacPort } from '../../application/services/rbac.port';

/**
 * Default adapters bridging shared RBAC into Language ports.
 */
export const createLanguageRbacAdapter = (): LanguageRbacPort => ({
  async hasAnyRole(userId: string, roles: string[]): Promise<boolean> {
    const { rbacService } = await import('@/modules/rbac');
    return rbacService.hasAnyRole(userId, roles);
  },
});
