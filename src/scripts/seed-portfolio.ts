/**
 * Production-safe portfolio seed entrypoint (compiled into dist/).
 *
 * Local:  npm run prisma:seed
 * Prod:   CONFIRM_PROD_SEED=yes npm run prisma:seed:prod
 *         (or compose profile `seed` — see docs/deployment/production.md)
 */
import { rbacService } from '@/modules/rbac';
import { seedPortfolioContent } from '@/scripts/seed/portfolio-content';
import prisma from '@/shared/infrastructure/database/prisma.client';
import log from '@/shared/infrastructure/logging/logger';

const main = async (): Promise<void> => {
  await rbacService.seedSystemRolesAndPermissions();
  log.info('System RBAC seeded');

  await seedPortfolioContent();
  log.info('Portfolio seed completed');
};

main()
  .catch((error) => {
    log.error('Portfolio seed failed', { error });
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
