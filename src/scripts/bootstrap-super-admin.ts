/**
 * One-shot upsert of a verified SUPER_ADMIN user.
 *
 * Local:  npm run bootstrap:admin
 * Prod:   CONFIRM_PROD_BOOTSTRAP_ADMIN=yes + required BOOTSTRAP_ADMIN_* env
 *         (compose profile `bootstrap-admin` — see docs/deployment/production.md)
 *
 * Never wire into CD. Never commit real passwords.
 */
import { config } from '@/app/config';
import { rbacService } from '@/modules/rbac';
import { SYSTEM_ROLES } from '@/shared/constants/app.constants';
import prisma from '@/shared/infrastructure/database/prisma.client';
import log from '@/shared/infrastructure/logging/logger';
import { hashPassword } from '@/shared/utils/crypto/hash-password';

const LOCAL_DEFAULT_EMAIL = 'admin@barthez-kenwou.dev';
const LOCAL_DEFAULT_PASSWORD = 'PortfolioAdmin!234';

function resolveCredentials(): {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
} {
  const {
    confirmProdBootstrapAdmin,
    adminEmail,
    adminPassword,
    adminFirstName,
    adminLastName,
    adminPhone,
    adminAvatarUrl,
  } = config.bootstrap;

  if (config.app.isProduction) {
    if (!confirmProdBootstrapAdmin) {
      throw new Error(
        'Refusing super-admin bootstrap in production. Set CONFIRM_PROD_BOOTSTRAP_ADMIN=yes to proceed.',
      );
    }
    if (!adminEmail || !adminPassword) {
      throw new Error(
        'BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD are required in production.',
      );
    }
    if (adminPassword.length < 12) {
      throw new Error('BOOTSTRAP_ADMIN_PASSWORD must be at least 12 characters.');
    }
  }

  const email = adminEmail || (!config.app.isProduction ? LOCAL_DEFAULT_EMAIL : '');
  const password = adminPassword || (!config.app.isProduction ? LOCAL_DEFAULT_PASSWORD : '');

  if (!email || !password) {
    throw new Error('BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD are required.');
  }

  return {
    email,
    password,
    firstName: adminFirstName || 'Barthez',
    lastName: adminLastName || 'Kenwou',
    phone: adminPhone || null,
    avatarUrl: adminAvatarUrl || null,
  };
}

const main = async (): Promise<void> => {
  const creds = resolveCredentials();

  if (config.app.isProduction) {
    log.warn('CONFIRM_PROD_BOOTSTRAP_ADMIN=yes — upserting verified SUPER_ADMIN', {
      email: creds.email,
    });
  }

  await rbacService.seedSystemRolesAndPermissions();
  log.info('System RBAC seeded');

  const passwordHash = await hashPassword(creds.password);
  const now = new Date();

  const user = await prisma.user.upsert({
    where: { email: creds.email },
    create: {
      email: creds.email,
      password: passwordHash,
      firstName: creds.firstName,
      lastName: creds.lastName,
      phone: creds.phone,
      avatarUrl: creds.avatarUrl,
      isActive: true,
      isVerified: true,
      emailVerifiedAt: now,
      lastPasswordChange: now,
      isDeleted: false,
      deletedAt: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
      otpFailedAttempts: 0,
      totpEnabled: false,
    },
    update: {
      password: passwordHash,
      firstName: creds.firstName,
      lastName: creds.lastName,
      phone: creds.phone,
      avatarUrl: creds.avatarUrl,
      isActive: true,
      isVerified: true,
      emailVerifiedAt: now,
      lastPasswordChange: now,
      isDeleted: false,
      deletedAt: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
      otpFailedAttempts: 0,
    },
  });

  await rbacService.assignRole(user.id, SYSTEM_ROLES.SUPER_ADMIN);

  log.info('Super-admin bootstrap completed', {
    userId: user.id,
    email: user.email,
    role: SYSTEM_ROLES.SUPER_ADMIN,
    isVerified: user.isVerified,
    isActive: user.isActive,
    hasAvatar: Boolean(user.avatarUrl),
    hasPhone: Boolean(user.phone),
  });

  // Structured stdout for operators (no password).
  console.log(
    JSON.stringify({
      ok: true,
      userId: user.id,
      email: user.email,
      role: SYSTEM_ROLES.SUPER_ADMIN,
      isVerified: true,
      isActive: true,
    }),
  );
};

main()
  .catch((error) => {
    log.error('Super-admin bootstrap failed', { error });
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
