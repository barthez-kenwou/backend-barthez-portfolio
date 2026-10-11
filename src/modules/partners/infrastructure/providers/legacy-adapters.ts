import type { PartnerRbacPort } from '../../application/services/rbac.port';

export const createPartnerRbacAdapter = (): PartnerRbacPort => ({
  async hasAnyRole(userId: string, roles: string[]): Promise<boolean> {
    const { rbacService } = await import('@/modules/rbac');
    return rbacService.hasAnyRole(userId, roles);
  },
});
