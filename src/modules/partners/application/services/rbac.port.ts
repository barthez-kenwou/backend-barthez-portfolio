export interface PartnerRbacPort {
  hasAnyRole(userId: string, roles: string[]): Promise<boolean>;
}
