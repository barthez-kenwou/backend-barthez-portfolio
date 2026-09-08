/**
 * Database seed entrypoint.
 *
 * 1. System RBAC roles & permissions
 * 2. Portfolio CMS content from frontend mocks (barthez-kenwou-porfolio)
 *
 * Run: npm run prisma:seed
 */
import { rbacService } from '@/modules/rbac';
import prisma from '@/shared/infrastructure/database/prisma.client';
import log from '@/shared/infrastructure/logging/logger';

import { seedPortfolioContent } from './seed/portfolio-content';

const main = async (): Promise<void> => {
  await rbacService.seedSystemRolesAndPermissions();
  log.info('System RBAC seeded');

  await seedPortfolioContent();
  log.info('Prisma seed completed');
};

main()
  .catch((error) => {
    log.error('Prisma seed failed', { error });
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
