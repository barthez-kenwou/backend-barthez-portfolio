import type { ProjectRbacPort } from '../../application/services/rbac.port';

/**
 * Default adapters bridging shared RBAC into Project ports.
 */
export const createProjectRbacAdapter = (): ProjectRbacPort => ({
  async hasAnyRole(userId: string, roles: string[]): Promise<boolean> {
    const { rbacService } = await import('@/modules/rbac');
    return rbacService.hasAnyRole(userId, roles);
  },
});
