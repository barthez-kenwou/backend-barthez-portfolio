import type { ExperienceRbacPort } from '../../application/services/rbac.port';

/**
 * Default adapters bridging shared RBAC into Experience ports.
 */
export const createExperienceRbacAdapter = (): ExperienceRbacPort => ({
  async hasAnyRole(userId: string, roles: string[]): Promise<boolean> {
    const { rbacService } = await import('@/modules/rbac');
    return rbacService.hasAnyRole(userId, roles);
  },
});
