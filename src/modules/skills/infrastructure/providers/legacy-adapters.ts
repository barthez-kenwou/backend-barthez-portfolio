import type { SkillRbacPort } from '../../application/services/rbac.port';

/**
 * Default adapters bridging shared RBAC into Skill ports.
 */
export const createSkillRbacAdapter = (): SkillRbacPort => ({
  async hasAnyRole(userId: string, roles: string[]): Promise<boolean> {
    const { rbacService } = await import('@/modules/rbac');
    return rbacService.hasAnyRole(userId, roles);
  },
});
