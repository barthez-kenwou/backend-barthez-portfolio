import type { TestimonialRbacPort } from '../../application/services/rbac.port';

/**
 * Default adapters bridging shared RBAC into Testimonial ports.
 */
export const createTestimonialRbacAdapter = (): TestimonialRbacPort => ({
  async hasAnyRole(userId: string, roles: string[]): Promise<boolean> {
    const { rbacService } = await import('@/modules/rbac');
    return rbacService.hasAnyRole(userId, roles);
  },
});
