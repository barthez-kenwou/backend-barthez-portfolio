/**
 * One-shot local bootstrap: create a verified super-admin for route testing.
 * Usage: npm run bootstrap:admin
 *   (or: tsx -r tsconfig-paths/register infra/scripts/bootstrap-admin.ts)
 *
 * This file is intentionally a .ts run via tsx for path aliases.
 */
import { rbacService } from '@/modules/rbac';
import { SYSTEM_ROLES } from '@/shared/constants/app.constants';
import prisma from '@/shared/infrastructure/database/prisma.client';
import { hashPassword } from '@/shared/utils/crypto/hash-password';

const EMAIL = process.env.BOOTSTRAP_ADMIN_EMAIL ?? 'admin@barthez-kenwou.dev';
const PASSWORD = process.env.BOOTSTRAP_ADMIN_PASSWORD ?? 'PortfolioAdmin!234';

async function main() {
  await rbacService.seedSystemRolesAndPermissions();

  const password = await hashPassword(PASSWORD);
  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    create: {
      email: EMAIL,
      password,
      firstName: 'Barthez',
      lastName: 'Kenwou',
      isActive: true,
      isVerified: true,
      emailVerifiedAt: new Date(),
    },
    update: {
      password,
      isActive: true,
      isVerified: true,
      emailVerifiedAt: new Date(),
      isDeleted: false,
      deletedAt: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  await rbacService.assignRole(user.id, SYSTEM_ROLES.SUPER_ADMIN);

  console.log(
    JSON.stringify({ ok: true, email: EMAIL, userId: user.id, role: SYSTEM_ROLES.SUPER_ADMIN }),
  );
}

void main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
