/**
 * Narrow RBAC port for Testimonial ownership elevation checks.
 */
export interface TestimonialRbacPort {
  hasAnyRole(userId: string, roles: string[]): Promise<boolean>;
}
