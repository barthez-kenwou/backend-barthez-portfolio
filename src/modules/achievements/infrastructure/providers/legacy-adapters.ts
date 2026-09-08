import type { AchievementRbacPort } from '../../application/services/rbac.port';

/**
 * Default adapters bridging shared RBAC into Achievement ports.
 */
export const createAchievementRbacAdapter = (): AchievementRbacPort => ({
  async hasAnyRole(userId: string, roles: string[]): Promise<boolean> {
    const { rbacService } = await import('@/modules/rbac');
    return rbacService.hasAnyRole(userId, roles);
  },
});
