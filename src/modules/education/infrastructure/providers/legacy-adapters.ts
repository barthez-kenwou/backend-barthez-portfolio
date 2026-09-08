import type { EducationRbacPort } from '../../application/services/rbac.port';

/**
 * Default adapters bridging shared RBAC into Education ports.
 */
export const createEducationRbacAdapter = (): EducationRbacPort => ({
  async hasAnyRole(userId: string, roles: string[]): Promise<boolean> {
    const { rbacService } = await import('@/modules/rbac');
    return rbacService.hasAnyRole(userId, roles);
  },
});
