import { SYSTEM_PERMISSIONS, SYSTEM_ROLES } from '@/shared/constants/app.constants';
import { prisma } from '@/shared/infrastructure/database';

import type { RbacRepositoryPort } from '../../domain/repositories/rbac.repository';
import type { RoleEntity, UserAuthContext } from '../../domain/types/rbac.types';

const toRoleEntity = (row: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
}): RoleEntity => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description,
  isSystem: row.isSystem,
  isActive: row.isActive,
});

/**
 * Prisma-backed RBAC repository.
 * Owns all role / permission / ACL persistence for the rbac module.
 */
export class PrismaRbacRepository implements RbacRepositoryPort {
  async seedSystemRolesAndPermissions(): Promise<void> {
    await Promise.all(
      SYSTEM_PERMISSIONS.map((perm) =>
        prisma.permission.upsert({
          where: { name: perm.name },
          create: { ...perm, isSystem: true },
          update: {},
        }),
      ),
    );

    const roleDefs = [
      {
        name: 'Super Admin',
        slug: SYSTEM_ROLES.SUPER_ADMIN,
        description: 'Full system access',
        perms: SYSTEM_PERMISSIONS.map((p) => p.name),
      },
      {
        name: 'Admin',
        slug: SYSTEM_ROLES.ADMIN,
        description: 'User administration',
        perms: [
          'user:read:any',
          'user:update:any',
          'user:delete:any',
          'user:export',
          'user:role:assign',
          'blog:read',
          'blog:create',
          'blog:update:own',
          'blog:update:any',
          'blog:delete:own',
          'blog:delete:any',
          'blog:publish',
          'contact_response:read',
          'contact_response:create',
          'contact_response:update:own',
          'contact_response:update:any',
          'contact_response:delete:own',
          'contact_response:delete:any',
          'newsletter:read',
          'newsletter:delete',
          'newsletter:broadcast',
          'contact_info:read',
          'contact_info:create',
          'contact_info:update:own',
          'contact_info:update:any',
          'contact_info:delete:own',
          'contact_info:delete:any',
          'education:read',
          'education:create',
          'education:update:own',
          'education:update:any',
          'education:delete:own',
          'education:delete:any',
          'language:read',
          'language:create',
          'language:update:own',
          'language:update:any',
          'language:delete:own',
          'language:delete:any',
          'reference:read',
          'reference:create',
          'reference:update:own',
          'reference:update:any',
          'reference:delete:own',
          'reference:delete:any',
          'achievement:read',
          'achievement:create',
          'achievement:update:own',
          'achievement:update:any',
          'achievement:delete:own',
          'achievement:delete:any',
          'testimonial:read',
          'testimonial:create',
          'testimonial:update:own',
          'testimonial:update:any',
          'testimonial:delete:own',
          'testimonial:delete:any',
          'certification:read',
          'certification:create',
          'certification:update:own',
          'certification:update:any',
          'certification:delete:own',
          'certification:delete:any',
          'experience:read',
          'experience:create',
          'experience:update:own',
          'experience:update:any',
          'experience:delete:own',
          'experience:delete:any',
          'skill:read',
          'skill:create',
          'skill:update:own',
          'skill:update:any',
          'skill:delete:own',
          'skill:delete:any',
          'service:read',
          'service:create',
          'service:update:own',
          'service:update:any',
          'service:delete:own',
          'service:delete:any',
          'project:read',
          'project:create',
          'project:update:own',
          'project:update:any',
          'project:delete:own',
          'project:delete:any',
          'audit:read',
        ],
      },
      {
        name: 'User',
        slug: SYSTEM_ROLES.USER,
        description: 'Standard user',
        perms: ['blog:create', 'blog:update:own', 'blog:delete:own', 'blog:publish'],
      },
      {
        name: 'Guest',
        slug: SYSTEM_ROLES.GUEST,
        description: 'Read-only public access',
        perms: ['blog:read'],
      },
    ];

    await Promise.all(
      roleDefs.map(async (roleDef) => {
        const role = await prisma.role.upsert({
          where: { slug: roleDef.slug },
          create: {
            name: roleDef.name,
            slug: roleDef.slug,
            description: roleDef.description,
            isSystem: true,
          },
          update: {},
        });

        await Promise.all(
          roleDef.perms.map(async (permName) => {
            const permission = await prisma.permission.findUnique({ where: { name: permName } });
            if (!permission) return;

            await prisma.rolePermission.upsert({
              where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
              create: { roleId: role.id, permissionId: permission.id },
              update: {},
            });
          }),
        );
      }),
    );
  }

  async findRoleBySlug(slug: string): Promise<RoleEntity | null> {
    const role = await prisma.role.findUnique({ where: { slug } });
    return role ? toRoleEntity(role) : null;
  }

  /**
   * Replaces all UserRole rows for the user with a single role.
   * Prevents privilege stacking (e.g. admin+user after a "demotion").
   */
  async assignRole(userId: string, slug: string): Promise<void> {
    const role = await prisma.role.findUnique({ where: { slug } });
    if (!role) return;

    await prisma.$transaction([
      prisma.userRole.deleteMany({ where: { userId } }),
      prisma.userRole.create({ data: { userId, roleId: role.id } }),
    ]);
  }

  async countUsersWithRole(slug: string): Promise<number> {
    const role = await prisma.role.findUnique({ where: { slug } });
    if (!role) return 0;
    return prisma.userRole.count({ where: { roleId: role.id } });
  }

  async getUserAuthContext(userId: string): Promise<UserAuthContext> {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            rolePermissions: { include: { permission: true } },
          },
        },
      },
    });

    const roles = userRoles.map((ur) => ur.role.slug);
    const permissions = new Set<string>();

    for (const ur of userRoles) {
      if (!ur.role.isActive) continue;
      for (const rp of ur.role.rolePermissions) {
        permissions.add(rp.permission.name);
      }
    }

    return { permissions: [...permissions], roles };
  }

  async countUsersWithAnyRole(slugs: string[]): Promise<number> {
    if (slugs.length === 0) return 0;

    const roles = await prisma.role.findMany({
      where: { slug: { in: slugs } },
      select: { id: true },
    });
    if (roles.length === 0) return 0;

    const rows = await prisma.userRole.findMany({
      where: { roleId: { in: roles.map((role) => role.id) } },
      select: { userId: true },
    });
    return new Set(rows.map((row) => row.userId)).size;
  }
}
